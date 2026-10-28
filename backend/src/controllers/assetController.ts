import { Request, Response } from "express";
import { dbStore } from "../services/dbStore.js";
import { analyzeDevice } from "../utils/recommendation.js";

export async function getAssets(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  let assets = dbStore.getAssets();

  // Customer Data Isolation: Customers only see their own devices
  if (user.role === "CUSTOMER") {
    assets = assets.filter((a) => a.customerId === user.id);
  }

  const { search, status, storageType } = req.query;

  if (status && typeof status === "string") {
    assets = assets.filter((a) => a.status.toUpperCase() === status.toUpperCase());
  }

  if (storageType && typeof storageType === "string") {
    assets = assets.filter((a) => a.storageType.toUpperCase() === storageType.toUpperCase());
  }

  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    assets = assets.filter(
      (a) =>
        a.assetId.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q) ||
        a.model.toLowerCase().includes(q) ||
        a.manufacturer.toLowerCase().includes(q) ||
        a.owner.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: assets.length, data: assets });
}

export async function getAssetById(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const { id } = req.params;

  const asset = dbStore.getAssets().find((a) => a.id === id || a.assetId === id);
  if (!asset) {
    res.status(404).json({ success: false, message: "Asset not found." });
    return;
  }

  // Customer Data Isolation
  if (user.role === "CUSTOMER" && asset.customerId !== user.id) {
    res.status(403).json({ success: false, message: "Unauthorized access to this asset." });
    return;
  }

  const wipeJobs = dbStore.getWipeJobs().filter((j) => j.assetId === asset.id);
  const verifications = dbStore.getVerifications().filter((v) => v.assetId === asset.id);
  const certificate = dbStore.getCertificates().find((c) => c.assetId === asset.id) || null;
  const recyclingApproval = dbStore.getRecyclingApprovals().find((r) => r.assetId === asset.id) || null;
  const auditLogs = dbStore.getAuditLogs().filter((l) => l.assetId === asset.id);

  res.json({
    success: true,
    data: {
      ...asset,
      wipeJobs,
      verifications,
      certificate,
      recyclingApproval,
      auditTimeline: auditLogs,
    },
  });
}

export async function createAsset(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const raw = req.body;

  const assetId = (raw.assetId || raw.assetTag || `AST-${Date.now().toString(36).toUpperCase()}`).trim();
  const serialNumber = (raw.serialNumber || `SN-${Date.now().toString(36).toUpperCase()}`).trim();
  const manufacturer = (raw.manufacturer || raw.make || "Standard").trim();
  const model = (raw.model || raw.name || "Enterprise Device").trim();
  const deviceType = raw.deviceType || raw.type || "Laptop";
  const storageType = raw.storageType || "SSD";
  const storageCapacity = Number(raw.storageCapacity || raw.storageCapacityGb || raw.capacityGb || 512);
  const operatingSystem = raw.operatingSystem || "Windows 11 Pro";
  const encryptionStatus = raw.encryptionStatus || (raw.isEncrypted !== undefined ? (raw.isEncrypted ? "Enabled" : "Disabled") : (raw.encryption || "Enabled"));
  const deviceHealth = raw.deviceHealth || raw.health || (raw.condition === "POOR" ? "Attention" : "Good");
  const owner = raw.owner || user.fullName;
  const department = raw.department || "Operations";
  const location = raw.location || "Central Data Center";
  const condition = raw.condition || "Decommissioned";
  const customerId = raw.customerId;

  if (!assetId || !serialNumber) {
    res.status(400).json({
      success: false,
      message: "Asset identifier and serial number are required.",
    });
    return;
  }

  // Check for duplicate assetId or serialNumber
  const duplicate = dbStore.getAssets().find(
    (a) => a.assetId.toLowerCase() === assetId.toLowerCase() || a.serialNumber.toLowerCase() === serialNumber.toLowerCase()
  );
  if (duplicate) {
    res.status(409).json({
      success: false,
      message: `Asset with ID '${assetId}' or serial '${serialNumber}' already exists.`,
    });
    return;
  }

  const effectiveCustomerId = user.role === "CUSTOMER" ? user.id : customerId || user.id;

  const newAsset = {
    id: `ast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    assetId: assetId.toUpperCase(),
    customerId: effectiveCustomerId,
    organizationId: user.organizationId || "org-apex-01",
    deviceType,
    manufacturer,
    model,
    serialNumber: serialNumber.toUpperCase(),
    storageType,
    storageCapacity: Number(storageCapacity),
    operatingSystem,
    encryptionStatus,
    deviceHealth,
    owner: owner || user.fullName,
    department: department || "IT Asset Disposition",
    location: location || "Main Depository",
    condition,
    status: "REGISTERED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await dbStore.saveAsset(newAsset);

  await dbStore.recordAudit(user.id, "ASSET_REGISTERED", newAsset.id, null, `Registered asset ${newAsset.assetId} (${newAsset.model})`);

  dbStore.notify(
    user.id,
    "Device Registered",
    `Asset ${newAsset.assetId} has been registered and is pending sanitization assessment.`,
    "SUCCESS"
  );

  res.status(201).json({ success: true, data: newAsset });
}

export async function updateAsset(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const { id } = req.params;

  const asset = dbStore.getAssets().find((a) => a.id === id || a.assetId === id);
  if (!asset) {
    res.status(404).json({ success: false, message: "Asset not found." });
    return;
  }

  if (user.role === "CUSTOMER" && asset.customerId !== user.id) {
    res.status(403).json({ success: false, message: "Unauthorized to update this asset." });
    return;
  }

  const allowedFields = ["owner", "department", "location", "condition", "deviceHealth", "encryptionStatus", "status"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      asset[field] = req.body[field];
    }
  });
  asset.updatedAt = new Date().toISOString();
  await dbStore.saveAsset(asset);

  await dbStore.recordAudit(user.id, "ASSET_UPDATED", asset.id, null, `Updated metadata for asset ${asset.assetId}`);

  res.json({ success: true, data: asset });
}

export async function analyzeAsset(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const asset = dbStore.getAssets().find((a) => a.id === id || a.assetId === id);

  if (!asset) {
    res.status(404).json({ success: false, message: "Asset not found." });
    return;
  }

  const analysis = analyzeDevice({
    storageType: asset.storageType,
    storageCapacity: asset.storageCapacity,
    encryptionStatus: asset.encryptionStatus,
    deviceHealth: asset.deviceHealth,
    operatingSystem: asset.operatingSystem,
    deviceType: asset.deviceType,
  });

  res.json({
    success: true,
    assetId: asset.assetId,
    deviceName: `${asset.manufacturer} ${asset.model}`,
    analysis,
  });
}
