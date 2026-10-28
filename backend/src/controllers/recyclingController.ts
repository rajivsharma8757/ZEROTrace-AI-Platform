import { Request, Response } from "express";
import { dbStore } from "../services/dbStore.js";

export async function getRecyclingStatus(req: Request, res: Response): Promise<void> {
  const approvals = dbStore.getRecyclingApprovals().map((r) => {
    const asset = dbStore.getAssets().find((a) => a.id === r.assetId);
    const approver = dbStore.getUsers().find((u) => u.id === r.approvedBy);
    return {
      ...r,
      asset: asset || null,
      approver: approver ? { id: approver.id, fullName: approver.fullName, role: approver.role } : null,
    };
  });

  // Eligible assets: must be CERTIFIED and not yet approved
  const eligibleAssets = dbStore.getAssets().filter((a) => {
    const isCertified = a.status === "CERTIFIED";
    const hasCert = dbStore.getCertificates().some((c) => c.assetId === a.id && c.status === "VALID");
    const alreadyApproved = dbStore.getRecyclingApprovals().some((r) => r.assetId === a.id && r.status === "APPROVED");
    return isCertified && hasCert && !alreadyApproved;
  });

  res.json({
    success: true,
    approvals,
    eligibleAssets,
  });
}

export async function approveRecycling(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const { assetId, reason = "Approved for certified downstream e-waste processing." } = req.body;

  const asset = dbStore.getAssets().find((a) => a.id === assetId || a.assetId === assetId);
  if (!asset) {
    res.status(404).json({ success: false, message: "Asset not found." });
    return;
  }

  // Precondition Check: Must have a valid certificate
  const cert = dbStore.getCertificates().find((c) => c.assetId === asset.id && c.status === "VALID");
  if (!cert) {
    res.status(400).json({
      success: false,
      message: "Compliance violation: Asset cannot be released for recycling without a valid digital sanitization certificate.",
    });
    return;
  }

  const existingApproval = dbStore.getRecyclingApprovals().find((r) => r.assetId === asset.id);
  if (existingApproval && existingApproval.status === "APPROVED") {
    res.status(409).json({ success: false, message: "Asset is already approved for recycling." });
    return;
  }

  const approval = {
    id: `rec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    assetId: asset.id,
    approvedBy: user.id,
    status: "APPROVED",
    reason,
    approvedAt: new Date().toISOString(),
  };

  if (existingApproval) {
    Object.assign(existingApproval, approval);
  } else {
    dbStore.getRecyclingApprovals().unshift(approval);
  }

  asset.status = "RECYCLING_APPROVED";
  asset.updatedAt = new Date().toISOString();
  await dbStore.saveAsset(asset);
  await dbStore.saveRecyclingApproval(approval);

  await dbStore.recordAudit(
    user.id,
    "RECYCLING_APPROVED",
    asset.id,
    null,
    `Auditor/Admin ${user.fullName} approved asset ${asset.assetId} for certified recycling. Reason: ${reason}`
  );

  dbStore.notify(
    user.id,
    "Recycling Release Approved",
    `Asset ${asset.assetId} has been authorized for downstream e-waste recycling and release.`,
    "SUCCESS"
  );

  res.status(201).json({ success: true, data: approval });
}

export async function rejectRecycling(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const { assetId, reason } = req.body;

  if (!reason) {
    res.status(400).json({ success: false, message: "Rejection requires an explanatory reason." });
    return;
  }

  const asset = dbStore.getAssets().find((a) => a.id === assetId || a.assetId === assetId);
  if (!asset) {
    res.status(404).json({ success: false, message: "Asset not found." });
    return;
  }

  const rejection = {
    id: `rec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    assetId: asset.id,
    approvedBy: user.id,
    status: "REJECTED",
    reason,
    approvedAt: new Date().toISOString(),
  };

  await dbStore.saveRecyclingApproval(rejection);

  await dbStore.recordAudit(
    user.id,
    "RECYCLING_REJECTED",
    asset.id,
    null,
    `Auditor/Admin ${user.fullName} rejected recycling for asset ${asset.assetId}. Reason: ${reason}`
  );

  dbStore.notify(
    user.id,
    "Recycling Authorization Rejected",
    `Asset ${asset.assetId} recycling authorization was rejected: ${reason}`,
    "WARNING"
  );

  res.json({ success: true, data: rejection });
}
