export type Role = "ADMIN" | "EMPLOYEE" | "CUSTOMER";
export type DeviceStatus = "REGISTERED" | "WIPE_PENDING" | "WIPING" | "VERIFICATION_PENDING" | "VERIFIED" | "CERTIFIED" | "READY_FOR_RECYCLING" | "RECYCLED" | "FAILED";
export type WipeStatus = "PENDING" | "INITIALIZING" | "DETECTING_STORAGE" | "PREPARING_SANITIZATION" | "SANITIZING" | "FINALIZING" | "VERIFICATION_PREPARATION" | "COMPLETED" | "FAILED";

export interface Organization { id: string; name: string; industry: string; }
export interface User { id: string; name: string; email: string; role: Role; organizationId: string; }
export interface Device { id: string; assetId: string; name: string; type: string; serialNumber: string; operatingSystem: string; storageType: "SSD" | "HDD" | "NVMe"; capacityGb: number; encryption: "Enabled" | "Disabled"; health: "Excellent" | "Good" | "Attention"; status: DeviceStatus; ownerId: string; assignedToId?: string; createdAt: string; }
export interface WipeJob { id: string; deviceId: string; operatorId?: string; method: string; securityLevel: string; estimatedMinutes: number; status: WipeStatus; progress: number; phase: string; createdAt: string; completedAt?: string; }
export interface Verification { id: string; deviceId: string; wipeJobId: string; method: string; result: "PENDING" | "PASS" | "FAIL"; evidence: string; verifiedAt?: string; verifierId?: string; }
export interface Certificate { id: string; deviceId: string; verificationId: string; hash: string; status: "VALID" | "REVOKED"; issuedAt: string; issuedBy: string; }
export interface AuditEvent { id: string; action: string; actorId: string; entityType: string; entityId: string; details: string; timestamp: string; previousHash: string; currentHash: string; }
export interface RecyclingApproval { id: string; deviceId: string; status: "PENDING" | "APPROVED" | "REJECTED"; approverId?: string; approvedAt?: string; notes: string; }
export interface Notification { id: string; userId: string; title: string; body: string; read: boolean; createdAt: string; }
export interface AppData { organizations: Organization[]; users: User[]; devices: Device[]; wipeJobs: WipeJob[]; verifications: Verification[]; certificates: Certificate[]; auditEvents: AuditEvent[]; recyclingApprovals: RecyclingApproval[]; notifications: Notification[]; }
