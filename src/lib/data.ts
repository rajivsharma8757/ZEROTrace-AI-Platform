import type { AppData, AuditEvent, Device, Role, User } from "./models";

const KEY = "zerotrace-ai-prototype-v1";
const now = () => new Date().toISOString();
const hash = (input: string) => {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) h = Math.imul(h ^ input.charCodeAt(i), 16777619);
  return `ZT-${(h >>> 0).toString(16).padStart(8, "0")}`;
};
export const id = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const users: User[] = [
  { id: "usr-admin", name: "Avery Morgan", email: "admin@zerotrace.demo", role: "ADMIN", organizationId: "org-zt" },
  { id: "usr-operator", name: "Riley Patel", email: "operator@zerotrace.demo", role: "EMPLOYEE", organizationId: "org-zt" },
  { id: "usr-customer", name: "Jordan Lee", email: "customer@zerotrace.demo", role: "CUSTOMER", organizationId: "org-zt" },
];
const seed: AppData = {
  organizations: [{ id: "org-zt", name: "Apex Technology Group", industry: "Enterprise IT" }], users,
  devices: [
    { id: "dev-1001", assetId: "APX-LT-1042", name: "Latitude 7440", type: "Laptop", serialNumber: "DL7440-9KX21", operatingSystem: "Windows 11 Pro", storageType: "NVMe", capacityGb: 512, encryption: "Enabled", health: "Excellent", status: "VERIFIED", ownerId: "usr-customer", assignedToId: "usr-operator", createdAt: "2026-08-18T09:00:00.000Z" },
    { id: "dev-1002", assetId: "APX-DT-2088", name: "OptiPlex 7010", type: "Desktop", serialNumber: "OP7010-7QB18", operatingSystem: "Windows 10 Pro", storageType: "SSD", capacityGb: 1024, encryption: "Enabled", health: "Good", status: "WIPING", ownerId: "usr-customer", assignedToId: "usr-operator", createdAt: "2026-08-19T09:00:00.000Z" },
    { id: "dev-1003", assetId: "APX-SRV-006", name: "PowerEdge R650", type: "Server", serialNumber: "PE650-4RD55", operatingSystem: "Ubuntu 24.04", storageType: "HDD", capacityGb: 4096, encryption: "Disabled", health: "Attention", status: "READY_FOR_RECYCLING", ownerId: "usr-admin", createdAt: "2026-08-16T09:00:00.000Z" },
    { id: "dev-1004", assetId: "APX-LT-1099", name: "MacBook Pro 14", type: "Laptop", serialNumber: "C02W4E7LHV2T", operatingSystem: "macOS Sonoma", storageType: "SSD", capacityGb: 512, encryption: "Enabled", health: "Excellent", status: "WIPE_PENDING", ownerId: "usr-customer", assignedToId: "usr-operator", createdAt: "2026-08-20T09:00:00.000Z" },
  ],
  wipeJobs: [
    { id: "wipe-1002", deviceId: "dev-1002", operatorId: "usr-operator", method: "NIST 800-88 Purge", securityLevel: "High", estimatedMinutes: 24, status: "SANITIZING", progress: 58, phase: "Sanitizing", createdAt: "2026-08-24T08:00:00.000Z" },
    { id: "wipe-1001", deviceId: "dev-1001", operatorId: "usr-operator", method: "NIST 800-88 Clear", securityLevel: "Standard", estimatedMinutes: 15, status: "COMPLETED", progress: 100, phase: "Verification preparation", createdAt: "2026-08-22T08:00:00.000Z", completedAt: "2026-08-22T08:19:00.000Z" },
  ],
  verifications: [{ id: "ver-1001", deviceId: "dev-1001", wipeJobId: "wipe-1001", method: "Cryptographic + sampled read verification", result: "PASS", evidence: "24 sampled sectors and encryption key disposition confirmed.", verifiedAt: "2026-08-22T08:23:00.000Z", verifierId: "usr-operator" }],
  certificates: [{ id: "ZT-2026-8F1A92", deviceId: "dev-1001", verificationId: "ver-1001", hash: "ZT-44b9cc1d", status: "VALID", issuedAt: "2026-08-22T08:25:00.000Z", issuedBy: "usr-admin" }],
  auditEvents: [], recyclingApprovals: [{ id: "rec-1003", deviceId: "dev-1003", status: "APPROVED", approverId: "usr-admin", approvedAt: "2026-08-21T11:00:00.000Z", notes: "Approved for certified downstream recycling." }], notifications: [{ id: "note-1", userId: "usr-operator", title: "Wipe in progress", body: "APX-DT-2088 is at 58% simulated sanitization.", read: false, createdAt: "2026-08-24T08:10:00.000Z" }],
};
export const getData = (): AppData => { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : structuredClone(seed); };
export const saveData = (data: AppData) => localStorage.setItem(KEY, JSON.stringify(data));
export const resetData = () => { localStorage.removeItem(KEY); };
export const audit = (data: AppData, actorId: string, action: string, entityType: string, entityId: string, details: string) => {
  const previousHash = data.auditEvents.at(-1)?.currentHash ?? "GENESIS";
  const event: AuditEvent = { id: id("audit"), action, actorId, entityType, entityId, details, timestamp: now(), previousHash, currentHash: hash(`${previousHash}|${action}|${entityId}|${details}|${now()}`) };
  data.auditEvents.push(event); return event;
};
export const recommendation = (device: Pick<Device, "storageType" | "capacityGb" | "encryption">) => ({
  method: device.storageType === "HDD" ? "NIST 800-88 Purge (overwrite)" : "NIST 800-88 Purge (cryptographic erase)",
  security: device.encryption === "Enabled" ? "High" : "Enhanced", duration: Math.max(8, Math.ceil(device.capacityGb / (device.storageType === "HDD" ? 30 : 70))),
  strategy: device.encryption === "Enabled" ? "Key disposition + sampled read verification" : "Multi-pass sampled read verification",
  reason: `${device.storageType} storage, ${device.capacityGb} GB capacity and encryption ${device.encryption.toLowerCase()} inform this demo recommendation.`, confidence: device.encryption === "Enabled" ? 94 : 86,
});
export const roleLabel = (role: Role) => role === "EMPLOYEE" ? "Employee / Operator" : role[0] + role.slice(1).toLowerCase();
