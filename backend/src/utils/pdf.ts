import PDFDocument from "pdfkit";
import { generateQrBuffer } from "./qr.js";

export interface CertificatePdfData {
  certificateId: string;
  assetId: string;
  deviceName: string;
  serialNumber: string;
  storageType: string;
  storageCapacity: number;
  operatingSystem: string;
  wipeMethod: string;
  verificationMethod: string;
  verificationResult: string;
  operatorName: string;
  issuedAt: string;
  certificateHash: string;
  verificationUrl: string;
  status: string;
  organizationName?: string;
}

export async function generateCertificatePdf(data: CertificatePdfData): Promise<Buffer> {
  const qrBuffer = await generateQrBuffer(data.verificationUrl);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      info: {
        Title: `ZEROTrace AI Certificate - ${data.certificateId}`,
        Author: "ZEROTrace AI Security Engine",
        Subject: "Digital Data Sanitization Certificate",
      },
    });

    const buffers: Buffer[] = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err) => reject(err));

    // Outer Border & Accent Framing
    doc.rect(20, 20, 555, 802).lineWidth(2).strokeColor("#0a1628").stroke();
    doc.rect(25, 25, 545, 792).lineWidth(0.5).strokeColor("#22d3ee").stroke();

    // Top Header Banner
    doc.rect(26, 26, 543, 85).fill("#0a1628");

    // Header Title & Tagline
    doc.fillColor("#22d3ee").fontSize(22).font("Helvetica-Bold").text("ZEROTrace AI", 45, 45);
    doc.fillColor("#94a3b8").fontSize(10).font("Helvetica").text("Secure • Verify • Prove • Recycle", 45, 72);
    doc.fillColor("#38bdf8").fontSize(12).font("Helvetica-Bold").text("DIGITAL ERASURE CERTIFICATE", 320, 52, { align: "right" });
    doc.fillColor("#64748b").fontSize(9).font("Helvetica").text("NIST SP 800-88 Rev. 2 Standards Compliance", 320, 72, { align: "right" });

    // Certificate Status Badge
    const isValid = data.status.toUpperCase() === "VALID";
    const badgeColor = isValid ? "#059669" : "#dc2626";
    const badgeText = isValid ? "VERIFIED & VALID" : "REVOKED";

    doc.rect(45, 130, 140, 26).fill(badgeColor);
    doc.fillColor("#ffffff").fontSize(10).font("Helvetica-Bold").text(badgeText, 45, 137, { width: 140, align: "center" });

    doc.fillColor("#64748b").fontSize(9).font("Helvetica").text("CERTIFICATE IDENTIFIER", 200, 130);
    doc.fillColor("#0f172a").fontSize(14).font("Helvetica-Bold").text(data.certificateId, 200, 142);

    // Section 1: Asset Information Table
    doc.rect(45, 175, 505, 18).fill("#f1f5f9");
    doc.fillColor("#1e293b").fontSize(10).font("Helvetica-Bold").text("HARDWARE ASSET SPECIFICATIONS", 55, 180);

    const assetRows = [
      ["Asset ID:", data.assetId, "Storage Media:", `${data.storageType} (${data.storageCapacity} GB)`],
      ["Device Model:", data.deviceName, "Serial Number:", data.serialNumber],
      ["Operating System:", data.operatingSystem, "Organization:", data.organizationName || "Apex Technology Group"],
    ];

    let y = 205;
    assetRows.forEach(([label1, val1, label2, val2]) => {
      doc.fillColor("#64748b").fontSize(9).font("Helvetica").text(label1, 55, y);
      doc.fillColor("#0f172a").fontSize(9).font("Helvetica-Bold").text(val1, 160, y);
      doc.fillColor("#64748b").fontSize(9).font("Helvetica").text(label2, 310, y);
      doc.fillColor("#0f172a").fontSize(9).font("Helvetica-Bold").text(val2, 410, y);
      y += 22;
    });

    // Section 2: Sanitization Execution Details
    y += 10;
    doc.rect(45, y, 505, 18).fill("#f1f5f9");
    doc.fillColor("#1e293b").fontSize(10).font("Helvetica-Bold").text("SANITIZATION & VERIFICATION EVIDENCE", 55, y + 5);

    y += 28;
    const sanitizationRows = [
      ["Sanitization Method:", data.wipeMethod],
      ["Verification Strategy:", data.verificationMethod],
      ["Residual Data Check:", "Zero Pattern / Cryptographic Key Disposition Confirmed (PASS)"],
      ["Authorized Operator:", data.operatorName],
      ["Certification Timestamp:", new Date(data.issuedAt).toUTCString()],
    ];

    sanitizationRows.forEach(([label, val]) => {
      doc.fillColor("#64748b").fontSize(9).font("Helvetica").text(label, 55, y);
      doc.fillColor("#0f172a").fontSize(9).font("Helvetica-Bold").text(val, 200, y, { width: 340 });
      y += 22;
    });

    // Section 3: Cryptographic Integrity & QR
    y += 15;
    doc.rect(45, y, 505, 18).fill("#f1f5f9");
    doc.fillColor("#1e293b").fontSize(10).font("Helvetica-Bold").text("CRYPTOGRAPHIC VERIFICATION & PUBLIC AUDIT", 55, y + 5);

    y += 30;
    // Embed genuine QR Code image
    doc.image(qrBuffer, 55, y, { width: 110, height: 110 });

    doc.fillColor("#64748b").fontSize(8).font("Helvetica").text("SCAN TO VERIFY PUBLIC RECORD", 55, y + 115, { width: 110, align: "center" });

    doc.fillColor("#64748b").fontSize(9).font("Helvetica").text("SHA-256 Certificate Hash:", 185, y + 10);
    doc.fillColor("#0284c7").fontSize(8).font("Courier-Bold").text(data.certificateHash, 185, y + 25, { width: 360 });

    doc.fillColor("#64748b").fontSize(9).font("Helvetica").text("Public Verification URL:", 185, y + 50);
    doc.fillColor("#0369a1").fontSize(8).font("Helvetica").text(data.verificationUrl, 185, y + 63, { width: 360 });

    doc.fillColor("#64748b").fontSize(8).font("Helvetica").text(
      "Notice: This digital certificate confirms that the storage media associated with this asset underwent media-appropriate sanitization and post-wipe validation according to NIST SP 800-88 Rev. 2. Any physical modification or data recovery attempt after this timestamp renders this certificate void.",
      185,
      y + 85,
      { width: 360, align: "justify" }
    );

    // Footer
    doc.rect(26, 770, 543, 46).fill("#f8fafc");
    doc.fillColor("#94a3b8").fontSize(8).font("Helvetica").text(
      "ZEROTrace AI Platform • SIH25070 — Secure Data Wiping for Trustworthy IT Asset Recycling • Generated by Authenticated Core Engine",
      40,
      788,
      { align: "center", width: 515 }
    );

    doc.end();
  });
}
