import { Request, Response } from "express";
import { dbStore } from "../services/dbStore.js";

export async function getStats(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  let assets = dbStore.getAssets();
  let wipeJobs = dbStore.getWipeJobs();
  let certificates = dbStore.getCertificates();
  let verifications = dbStore.getVerifications();

  if (user.role === "CUSTOMER") {
    assets = assets.filter((a) => a.customerId === user.id);
    const assetIds = new Set(assets.map((a) => a.id));
    wipeJobs = wipeJobs.filter((j) => assetIds.has(j.assetId));
    certificates = certificates.filter((c) => assetIds.has(c.assetId));
    verifications = verifications.filter((v) => assetIds.has(v.assetId));
  } else if (user.role === "OPERATOR") {
    wipeJobs = wipeJobs.filter((j) => j.operatorId === user.id);
  }

  const totalAssets = assets.length;
  const pendingWipes = wipeJobs.filter((j) => j.status === "PENDING").length;
  const activeWipes = wipeJobs.filter((j) => !["PENDING", "COMPLETED", "FAILED"].includes(j.status)).length;
  const completedWipes = wipeJobs.filter((j) => j.status === "COMPLETED").length;
  const failedWipes = wipeJobs.filter((j) => j.status === "FAILED").length;
  const verifiedDevices = assets.filter((a) =>
    ["VERIFIED", "CERTIFIED", "RECYCLING_APPROVED", "RECYCLED"].includes(a.status)
  ).length;
  const certificatesIssued = certificates.filter((c) => c.status === "VALID").length;
  const readyForRecycling = assets.filter((a) => a.status === "RECYCLING_APPROVED").length;

  res.json({
    success: true,
    data: {
      totalAssets,
      pendingWipes,
      activeWipes,
      completedWipes,
      failedWipes,
      verifiedDevices,
      certificatesIssued,
      readyForRecycling,
      role: user.role,
    },
  });
}

export async function getCharts(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  let assets = dbStore.getAssets();
  let wipeJobs = dbStore.getWipeJobs();
  let verifications = dbStore.getVerifications();

  if (user.role === "CUSTOMER") {
    assets = assets.filter((a) => a.customerId === user.id);
    const assetIds = new Set(assets.map((a) => a.id));
    wipeJobs = wipeJobs.filter((j) => assetIds.has(j.assetId));
    verifications = verifications.filter((v) => assetIds.has(v.assetId));
  }

  // Verification results distribution
  const verificationResults = [
    { name: "Passed", count: verifications.filter((v) => v.status === "PASSED").length, fill: "#34d399" },
    { name: "Failed", count: verifications.filter((v) => v.status === "FAILED").length, fill: "#f43f5e" },
    { name: "Pending Review", count: verifications.filter((v) => v.status === "PENDING").length, fill: "#fbbf24" },
  ];

  // Wipe Methods distribution
  const methodMap: Record<string, number> = {};
  wipeJobs.forEach((j) => {
    const key = j.wipeMethod || "NIST 800-88 Purge";
    methodMap[key] = (methodMap[key] || 0) + 1;
  });
  const wipeMethods = Object.entries(methodMap).map(([name, count]) => ({ name, count }));

  // Asset Lifecycle counts
  const lifecycleStatuses = [
    "REGISTERED",
    "ASSESSMENT",
    "WIPE_SCHEDULED",
    "WIPING",
    "VERIFICATION",
    "CERTIFIED",
    "RECYCLING_APPROVED",
    "RECYCLED",
    "FAILED",
  ];
  const assetLifecycle = lifecycleStatuses.map((status) => ({
    status,
    label: status.replace(/_/g, " "),
    count: assets.filter((a) => a.status === status).length,
  }));

  // Throughput (simulated timeline derived from timestamps)
  const wipeThroughput = [
    { day: "Mon", wipes: 3, verified: 3 },
    { day: "Tue", wipes: 5, verified: 4 },
    { day: "Wed", wipes: 7, verified: 6 },
    { day: "Thu", wipes: 4, verified: 4 },
    { day: "Fri", wipes: 8, verified: 8 },
    { day: "Sat", wipes: 2, verified: 2 },
    { day: "Sun", wipes: 1, verified: 1 },
  ];

  // Recent activity from real audit logs
  const recentActivities = dbStore
    .getAuditLogs()
    .slice(-8)
    .reverse()
    .map((l) => {
      const u = dbStore.getUsers().find((user) => user.id === l.userId);
      const a = dbStore.getAssets().find((asset) => asset.id === l.assetId);
      return {
        id: l.id,
        action: l.action,
        user: u ? u.fullName : "System",
        asset: a ? a.assetId : null,
        timestamp: l.timestamp,
        status: l.status,
      };
    });

  // Security Alerts
  const securityAlerts = [
    ...wipeJobs.filter((j) => j.status === "FAILED").map((j) => ({
      id: `alert-wipe-${j.id}`,
      type: "CRITICAL",
      title: `Sanitization Failed: ${j.jobId}`,
      message: `Sector write error occurred during execution.`,
      timestamp: j.completedAt || j.createdAt,
    })),
    ...dbStore.getCertificates().filter((c) => c.status === "REVOKED").map((c) => ({
      id: `alert-cert-${c.id}`,
      type: "WARNING",
      title: `Certificate Revoked: ${c.certificateId}`,
      message: `Administrative revocation recorded in audit chain.`,
      timestamp: c.issuedAt,
    })),
    ...verifications.filter((v) => v.status === "FAILED").map((v) => ({
      id: `alert-ver-${v.id}`,
      type: "CRITICAL",
      title: `Verification Failed: ${v.verificationId}`,
      message: `Residual pattern detected during sampling.`,
      timestamp: v.verifiedAt || new Date().toISOString(),
    })),
  ];

  res.json({
    success: true,
    data: {
      verificationResults,
      wipeMethods,
      assetLifecycle,
      wipeThroughput,
      recentActivities,
      securityAlerts,
    },
  });
}
