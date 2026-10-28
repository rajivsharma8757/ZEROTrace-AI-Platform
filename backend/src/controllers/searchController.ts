import { Request, Response } from "express";
import { dbStore } from "../services/dbStore.js";

export async function searchGlobal(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const q = String(req.query.q || "").toLowerCase().trim();

  if (!q) {
    res.json({ success: true, results: { assets: [], wipeJobs: [], certificates: [] } });
    return;
  }

  let assets = dbStore.getAssets();
  let certificates = dbStore.getCertificates();
  let wipeJobs = dbStore.getWipeJobs();

  // Customer Data Isolation
  if (user.role === "CUSTOMER") {
    assets = assets.filter((a) => a.customerId === user.id);
    const assetIds = new Set(assets.map((a) => a.id));
    certificates = certificates.filter((c) => assetIds.has(c.assetId));
    wipeJobs = wipeJobs.filter((j) => assetIds.has(j.assetId));
  }

  const matchedAssets = assets.filter(
    (a) =>
      a.assetId.toLowerCase().includes(q) ||
      a.serialNumber.toLowerCase().includes(q) ||
      a.model.toLowerCase().includes(q) ||
      a.manufacturer.toLowerCase().includes(q) ||
      a.owner.toLowerCase().includes(q)
  );

  const matchedCerts = certificates.filter(
    (c) =>
      c.certificateId.toLowerCase().includes(q) ||
      c.certificateHash.toLowerCase().includes(q) ||
      c.verificationCode.toLowerCase().includes(q)
  );

  const matchedJobs = wipeJobs.filter((j) => j.jobId.toLowerCase().includes(q));

  res.json({
    success: true,
    query: q,
    results: {
      assets: matchedAssets.slice(0, 10),
      certificates: matchedCerts.slice(0, 10),
      wipeJobs: matchedJobs.slice(0, 10),
    },
  });
}
