import { Request, Response } from "express";
import { dbStore } from "../services/dbStore.js";
import { generateCertificateHash } from "../utils/hash.js";
import { generateQrDataUrl } from "../utils/qr.js";
import { generateCertificatePdf } from "../utils/pdf.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";

export async function getCertificates(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  let certificates = dbStore.getCertificates().map((c) => {
    const asset = dbStore.getAssets().find((a) => a.id === c.assetId);
    const verification = dbStore.getVerifications().find((v) => v.id === c.verificationId);
    const operator = dbStore.getUsers().find((u) => u.id === c.operatorId);

    return {
      ...c,
      asset: asset || null,
      verification: verification || null,
      operator: operator ? { id: operator.id, fullName: operator.fullName, email: operator.email } : null,
    };
  });

  // Customer Data Isolation
  if (user.role === "CUSTOMER") {
    certificates = certificates.filter((c) => c.asset && c.asset.customerId === user.id);
  }

  res.json({ success: true, count: certificates.length, data: certificates });
}

export async function getCertificateById(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const { id } = req.params;

  const cert = dbStore.getCertificates().find((c) => c.id === id || c.certificateId === id);
  if (!cert) {
    res.status(404).json({ success: false, message: "Certificate not found." });
    return;
  }

  const asset = dbStore.getAssets().find((a) => a.id === cert.assetId);

  // Customer Data Isolation
  if (user.role === "CUSTOMER" && asset?.customerId !== user.id) {
    res.status(403).json({ success: false, message: "Unauthorized access to this certificate." });
    return;
  }

  const verification = dbStore.getVerifications().find((v) => v.id === cert.verificationId);
  const operator = dbStore.getUsers().find((u) => u.id === cert.operatorId);
  const qrDataUrl = await generateQrDataUrl(cert.qrData);

  res.json({
    success: true,
    data: {
      ...cert,
      qrDataUrl,
      asset: asset || null,
      verification: verification || null,
      operator: operator ? { id: operator.id, fullName: operator.fullName, email: operator.email } : null,
    },
  });
}

export async function generateCertificate(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const { verificationId } = req.body;

  const verification = dbStore.getVerifications().find(
    (v) => v.id === verificationId || v.verificationId === verificationId
  );
  if (!verification) {
    res.status(404).json({ success: false, message: "Verification record not found." });
    return;
  }

  if (verification.status !== "PASSED") {
    res.status(400).json({
      success: false,
      message: "Certificate cannot be issued for an unverified or failed sanitization job.",
    });
    return;
  }

  const asset = dbStore.getAssets().find((a) => a.id === verification.assetId);
  if (!asset) {
    res.status(404).json({ success: false, message: "Asset not found for verification." });
    return;
  }

  // Check if certificate already exists
  const existing = dbStore.getCertificates().find((c) => c.verificationId === verification.id || c.assetId === asset.id);
  if (existing) {
    res.status(409).json({ success: false, message: "Certificate already issued for this asset.", data: existing });
    return;
  }

  const wipeJob = dbStore.getWipeJobs().find((j) => j.id === verification.wipeJobId);
  const wipeMethod = wipeJob ? wipeJob.wipeMethod : "NIST SP 800-88 Purge";
  const now = new Date().toISOString();

  const certId = `ZT-${new Date().getFullYear()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
  const certHash = generateCertificateHash(asset.assetId, asset.serialNumber, wipeMethod, verification.verificationId, now);
  const verificationUrl = `${FRONTEND_URL}/verify/${certId}`;

  const newCert = {
    id: `cert-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    certificateId: certId,
    certificateNumber: certId,
    assetId: asset.id,
    verificationId: verification.id,
    wipeMethod,
    verificationMethod: verification.method,
    operatorId: user.id,
    certificateHash: certHash,
    hash: certHash,
    verificationCode: `VCODE-${asset.serialNumber.slice(-5)}-${certId.slice(-6)}`,
    qrData: verificationUrl,
    status: "VALID",
    issuedAt: now,
  };

  asset.status = "CERTIFIED";
  asset.updatedAt = now;
  await dbStore.saveAsset(asset);
  await dbStore.saveCertificate(newCert);

  await dbStore.recordAudit(
    user.id,
    "CERTIFICATE_GENERATED",
    asset.id,
    null,
    `Issued digital certificate ${certId} for asset ${asset.assetId} with hash ${certHash.slice(0, 16)}...`
  );

  dbStore.notify(
    user.id,
    "Certificate Issued",
    `Certificate ${certId} successfully issued for asset ${asset.assetId}.`,
    "SUCCESS"
  );

  const qrDataUrl = await generateQrDataUrl(verificationUrl);

  res.status(201).json({
    success: true,
    data: {
      ...newCert,
      qrDataUrl,
      asset,
    },
  });
}

export async function revokeCertificate(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const { id } = req.params;
  const { reason = "Manual administrative revocation" } = req.body;

  const cert = dbStore.getCertificates().find((c) => c.id === id || c.certificateId === id);
  if (!cert) {
    res.status(404).json({ success: false, message: "Certificate not found." });
    return;
  }

  cert.status = "REVOKED";
  await dbStore.saveCertificate(cert);

  await dbStore.recordAudit(
    user.id,
    "CERTIFICATE_REVOKED",
    cert.assetId,
    null,
    `Certificate ${cert.certificateId} revoked by ${user.fullName}. Reason: ${reason}`
  );

  dbStore.notify(
    user.id,
    "Certificate Revoked",
    `Certificate ${cert.certificateId} has been revoked. Reason: ${reason}`,
    "WARNING"
  );

  res.json({ success: true, data: cert });
}

export async function downloadPdf(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const cert = dbStore.getCertificates().find((c) => c.id === id || c.certificateId === id);

  if (!cert) {
    res.status(404).json({ success: false, message: "Certificate not found." });
    return;
  }

  const asset = dbStore.getAssets().find((a) => a.id === cert.assetId);
  const operator = dbStore.getUsers().find((u) => u.id === cert.operatorId);
  const org = asset ? dbStore.getOrganizations().find((o) => o.id === asset.organizationId) : null;

  try {
    const pdfBuffer = await generateCertificatePdf({
      certificateId: cert.certificateId,
      assetId: asset ? asset.assetId : "N/A",
      deviceName: asset ? `${asset.manufacturer} ${asset.model}` : "Unknown Device",
      serialNumber: asset ? asset.serialNumber : "N/A",
      storageType: asset ? asset.storageType : "SSD",
      storageCapacity: asset ? asset.storageCapacity : 512,
      operatingSystem: asset ? asset.operatingSystem : "Windows 11",
      wipeMethod: cert.wipeMethod,
      verificationMethod: cert.verificationMethod,
      verificationResult: "PASS (Zero Residual Pattern)",
      operatorName: operator ? operator.fullName : "Certified Operator",
      issuedAt: cert.issuedAt,
      certificateHash: cert.certificateHash,
      verificationUrl: cert.qrData,
      status: cert.status,
      organizationName: org ? org.name : "Apex Technology Group",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${cert.certificateId}_Certificate.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ success: false, message: "Failed to generate dynamic PDF certificate." });
  }
}

export async function publicVerify(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const cert = dbStore.getCertificates().find((c) => c.id === id || c.certificateId === id);

  if (!cert) {
    res.status(404).json({
      success: false,
      status: "NOT_FOUND",
      message: "Certificate not found in the ZEROTrace AI verification registry.",
    });
    return;
  }

  const asset = dbStore.getAssets().find((a) => a.id === cert.assetId);
  const verification = dbStore.getVerifications().find((v) => v.id === cert.verificationId);

  const assetSummary = asset
    ? {
        id: asset.id,
        assetTag: asset.assetId,
        assetId: asset.assetId,
        deviceType: asset.deviceType,
        make: asset.manufacturer,
        manufacturer: asset.manufacturer,
        model: asset.model,
        serialNumber: asset.serialNumber,
        storageType: asset.storageType,
        storageCapacityGb: asset.storageCapacity,
        storageCapacity: asset.storageCapacity,
        sanitizationStatus: "COMPLETED",
      }
    : null;

  const certData = {
    id: cert.id,
    certificateId: cert.certificateId,
    certificateNumber: cert.certificateId,
    status: cert.status,
    issuedAt: cert.issuedAt,
    certificateHash: cert.certificateHash,
    verificationCode: cert.verificationCode,
    sanitizationMethod: cert.wipeMethod,
    wipeMethod: cert.wipeMethod,
    verificationMethod: cert.verificationMethod,
    qrData: cert.qrData,
    asset: assetSummary,
    verificationResult: verification ? verification.status : "PASSED",
  };

  res.json({
    success: true,
    ...certData,
    certificate: certData,
  });
}
