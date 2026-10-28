import { Request, Response } from "express";
import { dbStore } from "../services/dbStore.js";

export async function getVerifications(req: Request, res: Response): Promise<void> {
  const verifications = dbStore.getVerifications().map((v) => {
    const asset = dbStore.getAssets().find((a) => a.id === v.assetId);
    const wipeJob = dbStore.getWipeJobs().find((j) => j.id === v.wipeJobId);
    const certificate = dbStore.getCertificates().find((c) => c.verificationId === v.id);

    return {
      ...v,
      asset: asset || null,
      wipeJob: wipeJob || null,
      certificate: certificate ? { id: certificate.id, certificateId: certificate.certificateId, status: certificate.status } : null,
    };
  });

  res.json({ success: true, count: verifications.length, data: verifications });
}

export async function getVerificationById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const v = dbStore.getVerifications().find((x) => x.id === id || x.verificationId === id);

  if (!v) {
    res.status(404).json({ success: false, message: "Verification record not found." });
    return;
  }

  const asset = dbStore.getAssets().find((a) => a.id === v.assetId);
  const wipeJob = dbStore.getWipeJobs().find((j) => j.id === v.wipeJobId);
  const certificate = dbStore.getCertificates().find((c) => c.verificationId === v.id);

  res.json({
    success: true,
    data: {
      ...v,
      asset: asset || null,
      wipeJob: wipeJob || null,
      certificate: certificate || null,
    },
  });
}

export async function submitDecision(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const { id } = req.params;
  const { decision, notes = "", blocksChecked = 2048, confidenceScore = 98 } = req.body;

  if (!["PASSED", "FAILED"].includes(decision?.toUpperCase())) {
    res.status(400).json({ success: false, message: "Decision must be either 'PASSED' or 'FAILED'." });
    return;
  }

  const ver = dbStore.getVerifications().find((v) => v.id === id || v.verificationId === id);
  if (!ver) {
    res.status(404).json({ success: false, message: "Verification record not found." });
    return;
  }

  const isPassed = decision.toUpperCase() === "PASSED";
  ver.status = isPassed ? "PASSED" : "FAILED";
  ver.verifiedAt = new Date().toISOString();
  ver.blocksChecked = Number(blocksChecked);
  ver.confidenceScore = Number(confidenceScore);
  ver.residualDataResult = isPassed
    ? "Verified: 0% Residual Pattern Detected (All Sampled LBAs Clean)"
    : `Failed: Sector Validation Error (${notes || "Residual magnetic/flash markers detected"})`;

  const asset = dbStore.getAssets().find((a) => a.id === ver.assetId);
  if (asset) {
    asset.status = isPassed ? "VERIFIED" : "FAILED";
    asset.updatedAt = new Date().toISOString();
    await dbStore.saveAsset(asset);
  }
  await dbStore.saveVerification(ver);

  const auditAction = isPassed ? "VERIFICATION_PASSED" : "VERIFICATION_FAILED";
  await dbStore.recordAudit(
    user.id,
    auditAction,
    asset?.id || null,
    ver.wipeJobId,
    `Operator ${user.fullName} recorded ${ver.status} for ${asset?.assetId} (${ver.verificationId})`
  );

  dbStore.notify(
    user.id,
    `Verification ${isPassed ? "Approved" : "Rejected"}`,
    `Asset ${asset?.assetId} verification marked ${ver.status}. ${isPassed ? "Eligible for certificate issuance." : "Retry required."}`,
    isPassed ? "SUCCESS" : "WARNING"
  );

  res.json({ success: true, data: ver });
}
