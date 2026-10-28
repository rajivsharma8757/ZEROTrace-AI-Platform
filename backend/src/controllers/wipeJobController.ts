import { Request, Response } from "express";
import { dbStore } from "../services/dbStore.js";

const PHASES = [
  { min: 0, max: 16, status: "INITIALIZING", label: "Initializing Sanitization Subsystem" },
  { min: 17, max: 33, status: "DETECTING_STORAGE", label: "Detecting Target Media & Partition Geometry" },
  { min: 34, max: 50, status: "PREPARING_SANITIZATION", label: "Preparing NIST SP 800-88 Purge Commands" },
  { min: 51, max: 67, status: "SANITIZING", label: "Executing Media Sanitization Protocol" },
  { min: 68, max: 83, status: "FINALIZING", label: "Finalizing Controller Sync & Flushing Buffers" },
  { min: 84, max: 99, status: "VERIFICATION_PREPARATION", label: "Preparing Post-Wipe Sector Verification Sample" },
];

export async function getWipeJobs(req: Request, res: Response): Promise<void> {
  const jobs = dbStore.getWipeJobs().map((j) => {
    const asset = dbStore.getAssets().find((a) => a.id === j.assetId);
    const operator = dbStore.getUsers().find((u) => u.id === j.operatorId);
    const currentPhase = PHASES.find((p) => j.progress >= p.min && j.progress <= p.max);
    const phaseLabel = j.status === "COMPLETED" ? "Ready for Verification" : (currentPhase ? currentPhase.label : j.status);

    return {
      ...j,
      currentPhase: phaseLabel,
      phase: phaseLabel,
      progressPercent: j.progress,
      asset: asset || null,
      operator: operator ? { id: operator.id, fullName: operator.fullName, email: operator.email } : null,
    };
  });

  res.json({ success: true, count: jobs.length, data: jobs });
}

export async function createWipeJob(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const { assetId, wipeMethod = "NIST 800-88 Purge (Cryptographic Erase)" } = req.body;

  const asset = dbStore.getAssets().find((a) => a.id === assetId || a.assetId === assetId);
  if (!asset) {
    res.status(404).json({ success: false, message: "Asset not found." });
    return;
  }

  // Prevent multiple active wipe jobs for the same asset
  const activeJob = dbStore.getWipeJobs().find(
    (j) => j.assetId === asset.id && !["COMPLETED", "FAILED"].includes(j.status)
  );
  if (activeJob) {
    res.status(400).json({
      success: false,
      message: `Asset already has an active wipe job (${activeJob.jobId}).`,
    });
    return;
  }

  const jobId = `WIPE-${Date.now().toString(36).slice(-4).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  const newJob = {
    id: `job-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    jobId,
    assetId: asset.id,
    operatorId: user.id,
    wipeMethod,
    status: "PENDING",
    progress: 0,
    startedAt: null,
    completedAt: null,
    createdAt: new Date().toISOString(),
  };

  asset.status = "WIPE_SCHEDULED";
  asset.updatedAt = new Date().toISOString();
  await dbStore.saveAsset(asset);
  await dbStore.saveWipeJob(newJob);

  await dbStore.recordAudit(user.id, "WIPE_CREATED", asset.id, newJob.id, `Created wipe job ${jobId} for asset ${asset.assetId}`);

  res.status(201).json({ success: true, data: newJob });
}

export async function startWipeJob(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const { id } = req.params;

  const job = dbStore.getWipeJobs().find((j) => j.id === id || j.jobId === id);
  if (!job) {
    res.status(404).json({ success: false, message: "Wipe job not found." });
    return;
  }

  const asset = dbStore.getAssets().find((a) => a.id === job.assetId);

  job.status = "INITIALIZING";
  job.progress = 5;
  job.startedAt = new Date().toISOString();

  if (asset) {
    asset.status = "WIPING";
    asset.updatedAt = new Date().toISOString();
    await dbStore.saveAsset(asset);
  }
  await dbStore.saveWipeJob(job);

  await dbStore.recordAudit(user.id, "WIPE_STARTED", asset?.id || null, job.id, `Started simulated wipe ${job.jobId} for ${asset?.assetId}`);

  dbStore.notify(
    user.id,
    "Simulated Wipe Started",
    `Wipe job ${job.jobId} for ${asset?.assetId} is now initializing.`,
    "INFO"
  );

  const phaseLabel = "Initializing Sanitization Subsystem";
  res.json({
    success: true,
    data: {
      ...job,
      currentPhase: phaseLabel,
      phase: phaseLabel,
      progressPercent: job.progress,
    },
  });
}

export async function advanceWipeJob(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const { id } = req.params;

  const job = dbStore.getWipeJobs().find((j) => j.id === id || j.jobId === id);
  if (!job) {
    res.status(404).json({ success: false, message: "Wipe job not found." });
    return;
  }

  const asset = dbStore.getAssets().find((a) => a.id === job.assetId);
  const nextProgress = Math.min(100, job.progress + 20);
  job.progress = nextProgress;

  if (nextProgress >= 100) {
    job.status = "COMPLETED";
    job.completedAt = new Date().toISOString();

    if (asset) {
      asset.status = "VERIFICATION";
      asset.updatedAt = new Date().toISOString();
      await dbStore.saveAsset(asset);
    }
    await dbStore.saveWipeJob(job);

    // Auto-create VerificationResult record
    const verId = `VER-${Date.now().toString(36).slice(-4).toUpperCase()}`;
    const newVer = {
      id: `ver-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      verificationId: verId,
      wipeJobId: job.id,
      assetId: asset?.id || job.assetId,
      method: "Cryptographic Key Destruction & Sampled Sector Reads",
      blocksChecked: 2048,
      residualDataResult: "Zero Pattern Confirmed (Awaiting Operator Approval)",
      confidenceScore: 98,
      status: "PENDING",
      verifiedAt: null,
    };
    await dbStore.saveVerification(newVer);

    await dbStore.recordAudit(
      user.id,
      "WIPE_COMPLETED",
      asset?.id || null,
      job.id,
      `Wipe job ${job.jobId} completed; queued verification ${verId}`
    );

    dbStore.notify(
      user.id,
      "Wipe Job Completed",
      `Simulated wipe ${job.jobId} completed successfully. Awaiting verification review.`,
      "SUCCESS"
    );
  } else {
    const currentPhase = PHASES.find((p) => nextProgress >= p.min && nextProgress <= p.max);
    if (currentPhase) {
      job.status = currentPhase.status;
    }
    await dbStore.saveWipeJob(job);
  }

  const currentPhase = PHASES.find((p) => job.progress >= p.min && job.progress <= p.max);
  const phaseLabel = job.status === "COMPLETED" ? "Ready for Verification" : (currentPhase ? currentPhase.label : job.status);

  res.json({
    success: true,
    data: {
      ...job,
      currentPhase: phaseLabel,
      phase: phaseLabel,
      progressPercent: job.progress,
    },
  });
}
