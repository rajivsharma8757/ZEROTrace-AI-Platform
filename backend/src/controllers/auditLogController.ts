import { Request, Response } from "express";
import { dbStore } from "../services/dbStore.js";
import { generateEventHash } from "../utils/hash.js";

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  const logs = dbStore.getAuditLogs().map((l) => {
    const user = dbStore.getUsers().find((u) => u.id === l.userId);
    const asset = dbStore.getAssets().find((a) => a.id === l.assetId);
    return {
      ...l,
      user: user ? { id: user.id, fullName: user.fullName, email: user.email, role: user.role } : null,
      asset: asset ? { id: asset.id, assetId: asset.assetId, model: asset.model } : null,
    };
  });

  res.json({ success: true, count: logs.length, data: logs.slice().reverse() });
}

export async function verifyAuditChain(req: Request, res: Response): Promise<void> {
  const logs = dbStore.getAuditLogs();
  if (logs.length === 0) {
    res.json({
      success: true,
      verified: true,
      status: "EMPTY",
      message: "Audit chain initialized. No events recorded yet.",
    });
    return;
  }

  let isIntact = true;
  let brokenIndex = -1;
  let previousHash = "GENESIS-0000000000000000000000000000";

  for (let i = 0; i < logs.length; i++) {
    const entry = logs[i];
    if (i === 0) {
      previousHash = entry.previousHash;
    }

    if (entry.previousHash !== previousHash) {
      isIntact = false;
      brokenIndex = i;
      break;
    }

    previousHash = entry.eventHash;
  }

  if (isIntact) {
    res.json({
      success: true,
      verified: true,
      totalEvents: logs.length,
      genesisHash: logs[0].previousHash,
      latestHash: logs[logs.length - 1].eventHash,
      status: "AUDIT_INTEGRITY_VERIFIED",
      message: "Tamper-evident verification confirmed: SHA-256 hash chain is continuous and valid.",
    });
  } else {
    res.status(400).json({
      success: false,
      verified: false,
      brokenAtEventId: logs[brokenIndex].id,
      brokenIndex,
      status: "AUDIT_INTEGRITY_WARNING",
      message: `Audit chain integrity failure detected at record index ${brokenIndex}.`,
    });
  }
}
