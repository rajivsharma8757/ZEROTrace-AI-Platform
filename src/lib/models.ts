export type Role =
  | "OWNER"
  | "ADMINISTRATOR"
  | "ADMIN"
  | "CREATOR"
  | "AUTHOR"
  | "TECHNICIAN"
  | "OPERATOR"
  | "AUDITOR"
  | "CUSTOMER"
  | "USER"
  | "EMPLOYEE";
export type DeviceStatus = "REGISTERED" | "WIPE_PENDING" | "WIPING" | "VERIFICATION_PENDING" | "VERIFIED" | "CERTIFIED" | "READY_FOR_RECYCLING" | "RECYCLED" | "FAILED";
export type WipeStatus = "PENDING" | "INITIALIZING" | "DETECTING_STORAGE" | "PREPARING_SANITIZATION" | "SANITIZING" | "FINALIZING" | "VERIFICATION_PREPARATION" | "COMPLETED" | "FAILED";

export interface Organization { id: string; name: string; industry?: string; domain?: string; }
export interface User { 
  id: string; 
  name: string; 
  fullName?: string; 
  email: string; 
  role: Role; 
  organizationId: string; 
  department?: string; 
  status?: string; 
  createdAt?: string; 
  lastLogin?: string | null; 
}
export interface Device { 
  id: string; 
  assetId?: string; 
  assetTag?: string; 
  name: string; 
  type?: string; 
  deviceType?: string; 
  make?: string; 
  model?: string; 
  serialNumber: string; 
  operatingSystem?: string; 
  storageType: "SSD" | "HDD" | "NVMe" | string; 
  capacityGb: number; 
  encryption?: "Enabled" | "Disabled" | string; 
  health?: "Excellent" | "Good" | "Attention" | string; 
  condition?: string; 
  status: DeviceStatus | string; 
  ownerId?: string; 
  assignedToId?: string; 
  createdAt: string; 
}
export interface WipeJob { 
  id: string; 
  deviceId?: string; 
  assetId?: string; 
  operatorId?: string; 
  method?: string; 
  wipeMethod?: string; 
  securityLevel?: string; 
  estimatedMinutes?: number; 
  status: WipeStatus | string; 
  progress: number; 
  phase?: string; 
  currentPass?: number; 
  totalPasses?: number; 
  createdAt: string; 
  completedAt?: string; 
  device?: Device; 
  asset?: any; 
  operator?: any; 
}
export interface Verification { 
  id: string; 
  deviceId?: string; 
  assetId?: string; 
  wipeJobId: string; 
  method?: string; 
  verificationMethod?: string; 
  result?: "PENDING" | "PASS" | "FAIL" | string; 
  status?: string; 
  evidence?: string; 
  notes?: string; 
  verifiedAt?: string; 
  verifierId?: string; 
  asset?: any; 
  wipeJob?: any; 
}
export interface Certificate { 
  id: string; 
  certificateNumber?: string; 
  deviceId?: string; 
  assetId?: string; 
  verificationId: string; 
  hash?: string; 
  certificateHash?: string; 
  qrCodeUrl?: string; 
  status: "VALID" | "REVOKED" | string; 
  issuedAt: string; 
  issuedBy: string; 
  asset?: any; 
  issuer?: any; 
  verification?: any; 
}
export interface AuditEvent { 
  id: string; 
  action: string; 
  actorId?: string; 
  userId?: string; 
  user?: any; 
  entityType?: string; 
  entityId?: string; 
  details?: string; 
  description?: string; 
  timestamp: string; 
  previousHash?: string; 
  currentHash?: string; 
  hash?: string; 
}
export interface RecyclingApproval { 
  id: string; 
  deviceId?: string; 
  assetId?: string; 
  status: "PENDING" | "APPROVED" | "REJECTED" | string; 
  approverId?: string; 
  approvedAt?: string; 
  notes?: string; 
  reason?: string; 
  asset?: any; 
}
export interface Notification { 
  id: string; 
  userId?: string; 
  title: string; 
  body?: string; 
  message?: string; 
  read: boolean; 
  isRead?: boolean; 
  type?: string; 
  createdAt: string; 
}
export interface AppData { organizations: Organization[]; users: User[]; devices: Device[]; wipeJobs: WipeJob[]; verifications: Verification[]; certificates: Certificate[]; auditEvents: AuditEvent[]; recyclingApprovals: RecyclingApproval[]; notifications: Notification[]; }
