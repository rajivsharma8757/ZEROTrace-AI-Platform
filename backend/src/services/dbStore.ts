import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { prisma, checkDbConnection } from "../utils/prisma.js";
import { generateEventHash, generateCertificateHash } from "../utils/hash.js";

function resolveDbFilePath(): string {
  const candidates = [
    path.resolve(process.cwd(), "data", "zerotrace_store.json"),
    path.resolve(process.cwd(), "backend", "data", "zerotrace_store.json"),
    path.resolve(process.cwd(), "..", "data", "zerotrace_store.json"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

const DB_FILE = resolveDbFilePath();
const DATA_DIR = path.dirname(DB_FILE);

export interface DbState {
  organizations: any[];
  users: any[];
  assets: any[];
  wipeJobs: any[];
  verificationResults: any[];
  certificates: any[];
  auditLogs: any[];
  notifications: any[];
  recyclingApprovals: any[];
  invitations: any[];
}

class DatabaseStore {
  public isPostgresAvailable: boolean = false;
  private state: DbState = {
    organizations: [],
    users: [],
    assets: [],
    wipeJobs: [],
    verificationResults: [],
    certificates: [],
    auditLogs: [],
    notifications: [],
    recyclingApprovals: [],
    invitations: [],
  };

  constructor() {
    this.initFileStore();
  }

  public async init() {
    const isProduction = process.env.NODE_ENV === "production";
    const requirePostgres = isProduction || process.env.REQUIRE_POSTGRES === "true";
    const hasDatabaseUrl = Boolean(
      process.env.DATABASE_URL &&
      process.env.DATABASE_URL.trim() !== ""
    );

    this.isPostgresAvailable = await checkDbConnection();
    if (this.isPostgresAvailable) {
      console.log("Connected to PostgreSQL via Prisma successfully.");
      await this.syncAndSeedPostgres();
    } else if (requirePostgres && process.env.ALLOW_LOCAL_STORAGE !== "true") {
      const errMessage = hasDatabaseUrl
        ? "CRITICAL: DATABASE_URL is configured but connection to PostgreSQL failed. Production startup aborted to prevent silent fallback to ephemeral storage."
        : "CRITICAL: Running in production mode without a reachable PostgreSQL database. PostgreSQL is required in production. Set a valid DATABASE_URL or set ALLOW_LOCAL_STORAGE=true to override.";
      console.error(errMessage);
      throw new Error(errMessage);
    } else {
      console.warn("PostgreSQL not responding at DATABASE_URL. Running in resilient local database mode.");
      this.ensureSeedData();
    }
  }

  private initFileStore() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.state = JSON.parse(raw);
        if (!this.state.invitations) this.state.invitations = [];
      } catch (e) {
        this.ensureSeedData();
      }
    } else {
      this.ensureSeedData();
    }
  }

  private save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), "utf-8");
  }

  // PostgreSQL Sync and Seeding
  private async syncAndSeedPostgres() {
    try {
      const salt = bcrypt.genSaltSync(10);
      const orgId = "org-apex-01";

      // 1. Ensure Organization
      let org = await prisma.organization.findUnique({ where: { id: orgId } });
      if (!org) {
        org = await prisma.organization.create({
          data: {
            id: orgId,
            name: "Apex Technology Group",
            address: "Cyber City, Phase II, Gurugram, India",
            contact: "+91 (124) 490-2000",
          },
        });
      }

      // 2. Ensure Default Seed Accounts
      const defaultSeedUsers = [
        {
          id: "usr-admin-01",
          fullName: "Avery Morgan",
          email: "admin@zerotrace.demo",
          passwordHash: bcrypt.hashSync("Admin@12345", salt),
          role: "ADMINISTRATOR" as const,
          organizationId: orgId,
          department: "Cybersecurity & Governance",
          status: "ACTIVE",
          emailVerified: true,
        },
        {
          id: "usr-operator-01",
          fullName: "Riley Patel",
          email: "operator@zerotrace.demo",
          passwordHash: bcrypt.hashSync("Operator@12345", salt),
          role: "TECHNICIAN" as const,
          organizationId: orgId,
          department: "Media Sanitization Operations",
          status: "ACTIVE",
          emailVerified: true,
        },
        {
          id: "usr-auditor-01",
          fullName: "Dr. Evelyn Reed",
          email: "auditor@zerotrace.demo",
          passwordHash: bcrypt.hashSync("Auditor@12345", salt),
          role: "AUDITOR" as const,
          organizationId: orgId,
          department: "Independent Compliance Office",
          status: "ACTIVE",
          emailVerified: true,
        },
        {
          id: "usr-customer-01",
          fullName: "Jordan Lee",
          email: "customer@zerotrace.demo",
          passwordHash: bcrypt.hashSync("Customer@12345", salt),
          role: "USER" as const,
          organizationId: orgId,
          department: "Enterprise Asset Logistics",
          status: "ACTIVE",
          emailVerified: true,
        },
      ];

      for (const su of defaultSeedUsers) {
        const existing = await prisma.user.findUnique({ where: { email: su.email } });
        if (!existing) {
          await prisma.user.create({ data: su });
        }
      }

      // 3. One-Time Secure Owner Provisioning / Bootstrap
      const ownerEmail = process.env.OWNER_EMAIL?.trim();
      if (ownerEmail) {
        const lowerOwnerEmail = ownerEmail.toLowerCase();
        const existingOwner = await prisma.user.findUnique({ where: { email: lowerOwnerEmail } });
        if (existingOwner) {
          if (existingOwner.role !== "OWNER" || !existingOwner.emailVerified || existingOwner.status !== "ACTIVE") {
            await prisma.user.update({
              where: { email: lowerOwnerEmail },
              data: { role: "OWNER", emailVerified: true, status: "ACTIVE" },
            });
          }
          console.log("[Owner Bootstrap] Verified Owner role active for configured OWNER_EMAIL.");
        } else {
          const ownerPass = process.env.OWNER_INITIAL_PASSWORD || "Owner@12345";
          await prisma.user.create({
            data: {
              id: `usr-owner-${Date.now().toString(36)}`,
              fullName: "Rajiv Kumar Sharma",
              email: lowerOwnerEmail,
              passwordHash: bcrypt.hashSync(ownerPass, salt),
              role: "OWNER",
              organizationId: orgId,
              department: "Executive Management",
              status: "ACTIVE",
              emailVerified: true,
            },
          });
          console.log("[Owner Bootstrap] Verified Owner account provisioned for configured OWNER_EMAIL.");
        }
      }

      // 4. Populate Local Cache from PostgreSQL
      const [pgUsers, pgAssets, pgJobs, pgCerts, pgVerifs, pgLogs, pgNotifs, pgApprovals, pgInvs] =
        await Promise.all([
          prisma.user.findMany(),
          prisma.asset.findMany(),
          prisma.wipeJob.findMany(),
          prisma.certificate.findMany(),
          prisma.verificationResult.findMany(),
          prisma.auditLog.findMany({ orderBy: { timestamp: "asc" } }),
          prisma.notification.findMany({ orderBy: { createdAt: "desc" } }),
          prisma.recyclingApproval.findMany(),
          prisma.invitation.findMany(),
        ]);

      this.state.organizations = [org];
      this.state.users = pgUsers;
      this.state.assets = pgAssets;
      this.state.wipeJobs = pgJobs;
      this.state.certificates = pgCerts;
      this.state.verificationResults = pgVerifs;
      this.state.auditLogs = pgLogs;
      this.state.notifications = pgNotifs;
      this.state.recyclingApprovals = pgApprovals;
      this.state.invitations = pgInvs;

      // Seed assets and workflow items if database was blank
      if (pgAssets.length === 0) {
        this.ensureSeedData();
        // Push seed assets and jobs to PostgreSQL
        for (const a of this.state.assets) {
          try {
            await prisma.asset.create({ data: { ...a, organizationId: orgId } });
          } catch {}
        }
        for (const j of this.state.wipeJobs) {
          try {
            await prisma.wipeJob.create({ data: j });
          } catch {}
        }
        for (const v of this.state.verificationResults) {
          try {
            await prisma.verificationResult.create({ data: v });
          } catch {}
        }
        for (const c of this.state.certificates) {
          try {
            await prisma.certificate.create({ data: c });
          } catch {}
        }
        for (const l of this.state.auditLogs) {
          try {
            await prisma.auditLog.create({ data: l });
          } catch {}
        }
        for (const n of this.state.notifications) {
          try {
            await prisma.notification.create({ data: n });
          } catch {}
        }
        for (const r of this.state.recyclingApprovals) {
          try {
            await prisma.recyclingApproval.create({ data: r });
          } catch {}
        }
      }

      this.save();
    } catch (err: any) {
      console.error("Failed to sync and seed PostgreSQL:", err.message);
    }
  }

  public ensureSeedData() {
    if (this.state.users.length === 0) {
      const salt = bcrypt.genSaltSync(10);
      const orgId = "org-apex-01";

      this.state.organizations = [
        {
          id: orgId,
          name: "Apex Technology Group",
          address: "Cyber City, Phase II, Gurugram, India",
          contact: "+91 (124) 490-2000",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      this.state.users = [
        {
          id: "usr-admin-01",
          fullName: "Avery Morgan",
          email: "admin@zerotrace.demo",
          passwordHash: bcrypt.hashSync("Admin@12345", salt),
          role: "ADMINISTRATOR",
          organizationId: orgId,
          department: "Cybersecurity & Governance",
          status: "ACTIVE",
          emailVerified: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "usr-operator-01",
          fullName: "Riley Patel",
          email: "operator@zerotrace.demo",
          passwordHash: bcrypt.hashSync("Operator@12345", salt),
          role: "TECHNICIAN",
          organizationId: orgId,
          department: "Media Sanitization Operations",
          status: "ACTIVE",
          emailVerified: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "usr-auditor-01",
          fullName: "Dr. Evelyn Reed",
          email: "auditor@zerotrace.demo",
          passwordHash: bcrypt.hashSync("Auditor@12345", salt),
          role: "AUDITOR",
          organizationId: orgId,
          department: "Independent Compliance Office",
          status: "ACTIVE",
          emailVerified: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "usr-customer-01",
          fullName: "Jordan Lee",
          email: "customer@zerotrace.demo",
          passwordHash: bcrypt.hashSync("Customer@12345", salt),
          role: "USER",
          organizationId: orgId,
          department: "Enterprise Asset Logistics",
          status: "ACTIVE",
          emailVerified: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Add owner account if OWNER_EMAIL is defined
      const ownerEmail = process.env.OWNER_EMAIL?.trim();
      if (ownerEmail) {
        this.state.users.unshift({
          id: "usr-owner-01",
          fullName: "Rajiv Kumar Sharma",
          email: ownerEmail.toLowerCase(),
          passwordHash: bcrypt.hashSync(process.env.OWNER_INITIAL_PASSWORD || "Owner@12345", salt),
          role: "OWNER",
          organizationId: orgId,
          department: "Executive Management",
          status: "ACTIVE",
          emailVerified: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      this.state.assets = [
        {
          id: "ast-1001",
          assetId: "APX-LT-1042",
          customerId: "usr-customer-01",
          organizationId: orgId,
          deviceType: "Laptop",
          manufacturer: "Dell",
          model: "Latitude 7440",
          serialNumber: "DL7440-9KX21",
          storageType: "NVMe",
          storageCapacity: 512,
          operatingSystem: "Windows 11 Pro",
          encryptionStatus: "Enabled",
          deviceHealth: "Excellent",
          owner: "Jordan Lee",
          department: "Executive Logistics",
          location: "Building 4, Floor 2",
          condition: "Decommissioned - Grade A",
          status: "CERTIFIED",
          createdAt: "2026-08-18T09:00:00.000Z",
          updatedAt: "2026-08-22T08:25:00.000Z",
        },
        {
          id: "ast-1002",
          assetId: "APX-DT-2088",
          customerId: "usr-customer-01",
          organizationId: orgId,
          deviceType: "Desktop",
          manufacturer: "Dell",
          model: "OptiPlex 7010",
          serialNumber: "OP7010-7QB18",
          storageType: "SSD",
          storageCapacity: 1024,
          operatingSystem: "Windows 10 Pro",
          encryptionStatus: "Enabled",
          deviceHealth: "Good",
          owner: "Finance Workstation",
          department: "Finance Operations",
          location: "HQ Wing C",
          condition: "End of Lease",
          status: "WIPING",
          createdAt: "2026-08-19T09:00:00.000Z",
          updatedAt: "2026-08-24T08:15:00.000Z",
        },
        {
          id: "ast-1003",
          assetId: "APX-SRV-006",
          customerId: "usr-admin-01",
          organizationId: orgId,
          deviceType: "Server",
          manufacturer: "Dell EMC",
          model: "PowerEdge R650",
          serialNumber: "PE650-4RD55",
          storageType: "HDD",
          storageCapacity: 4096,
          operatingSystem: "Ubuntu 24.04 LTS",
          encryptionStatus: "Disabled",
          deviceHealth: "Attention",
          owner: "Datacenter Cluster 2",
          department: "Cloud Infrastructure",
          location: "DC Tier 3 - Rack 12",
          condition: "Retired Storage Blade",
          status: "RECYCLING_APPROVED",
          createdAt: "2026-08-16T09:00:00.000Z",
          updatedAt: "2026-08-21T11:00:00.000Z",
        },
        {
          id: "ast-1004",
          assetId: "APX-LT-1099",
          customerId: "usr-customer-01",
          organizationId: orgId,
          deviceType: "Laptop",
          manufacturer: "Apple",
          model: "MacBook Pro 14",
          serialNumber: "C02W4E7LHV2T",
          storageType: "SSD",
          storageCapacity: 512,
          operatingSystem: "macOS Sonoma",
          encryptionStatus: "Enabled",
          deviceHealth: "Excellent",
          owner: "Product Marketing",
          department: "Product Design",
          location: "Building 1",
          condition: "Surplus Hardware",
          status: "WIPE_SCHEDULED",
          createdAt: "2026-08-20T09:00:00.000Z",
          updatedAt: "2026-08-20T09:00:00.000Z",
        },
      ];

      this.state.wipeJobs = [
        {
          id: "job-1001",
          jobId: "WIPE-1001",
          assetId: "ast-1001",
          operatorId: "usr-operator-01",
          wipeMethod: "NIST 800-88 Purge (Cryptographic Erase)",
          status: "COMPLETED",
          progress: 100,
          startedAt: "2026-08-22T08:00:00.000Z",
          completedAt: "2026-08-22T08:19:00.000Z",
          createdAt: "2026-08-22T07:55:00.000Z",
        },
        {
          id: "job-1002",
          jobId: "WIPE-1002",
          assetId: "ast-1002",
          operatorId: "usr-operator-01",
          wipeMethod: "DoD 5220.22-M 3-Pass Overwrite",
          status: "SANITIZING",
          progress: 58,
          startedAt: "2026-08-24T08:00:00.000Z",
          completedAt: null,
          createdAt: "2026-08-24T07:45:00.000Z",
        },
      ];

      this.state.verificationResults = [
        {
          id: "ver-1001",
          verificationId: "VER-2026-0891",
          wipeJobId: "job-1001",
          assetId: "ast-1001",
          method: "Cryptographic Entropy & Zero-Pattern Random Read",
          blocksChecked: 2048,
          residualDataResult: "0 Bytes detected (Clean High-Entropy Random Pattern)",
          confidenceScore: 99,
          status: "PASSED",
          verifiedAt: "2026-08-22T08:23:00.000Z",
        },
      ];

      this.state.certificates = [
        {
          id: "cert-1001",
          certificateId: "ZT-2026-8F1A92",
          assetId: "ast-1001",
          verificationId: "ver-1001",
          wipeMethod: "NIST 800-88 Purge (Cryptographic Erase)",
          verificationMethod: "Cryptographic Entropy & Zero-Pattern Random Read",
          operatorId: "usr-operator-01",
          certificateHash: generateCertificateHash("ast-1001", "DL7440-9KX21", "NIST 800-88 Purge", "ver-1001", "2026-08-22T08:25:00.000Z"),
          verificationCode: "VF-9812",
          qrData: "http://localhost:8081/verify/ZT-2026-8F1A92",
          status: "VALID",
          issuedAt: "2026-08-22T08:25:00.000Z",
        },
      ];

      this.state.recyclingApprovals = [
        {
          id: "rec-1001",
          assetId: "ast-1003",
          approvedBy: "usr-admin-01",
          status: "APPROVED",
          reason: "Certified compliant with NIST 800-88 standards; approved for authorized downstream e-waste recycling.",
          approvedAt: "2026-08-21T11:00:00.000Z",
        },
      ];

      const genesisHash = "GENESIS-0000000000000000000000000000";
      const h1 = generateEventHash(genesisHash, "SYSTEM_INIT", "sys-01", "ZEROTrace AI Platform Initialized", "2026-08-16T08:00:00.000Z");
      const h2 = generateEventHash(h1, "ASSET_REGISTERED", "ast-1001", "Asset APX-LT-1042 registered by Jordan Lee", "2026-08-18T09:00:00.000Z");
      const h3 = generateEventHash(h2, "WIPE_COMPLETED", "job-1001", "NIST Purge completed for APX-LT-1042", "2026-08-22T08:19:00.000Z");
      const h4 = generateEventHash(h3, "VERIFICATION_PASSED", "ver-1001", "Sampled 2048 blocks: 0 residual pattern", "2026-08-22T08:23:00.000Z");
      const h5 = generateEventHash(h4, "CERTIFICATE_ISSUED", "cert-1001", "Certificate ZT-2026-8F1A92 issued", "2026-08-22T08:25:00.000Z");

      this.state.auditLogs = [
        { id: "aud-01", userId: "usr-admin-01", action: "SYSTEM_INIT", assetId: null, jobId: null, timestamp: "2026-08-16T08:00:00.000Z", previousHash: genesisHash, eventHash: h1, status: "VERIFIED" },
        { id: "aud-02", userId: "usr-customer-01", action: "ASSET_REGISTERED", assetId: "ast-1001", jobId: null, timestamp: "2026-08-18T09:00:00.000Z", previousHash: h1, eventHash: h2, status: "VERIFIED" },
        { id: "aud-03", userId: "usr-operator-01", action: "WIPE_COMPLETED", assetId: "ast-1001", jobId: "job-1001", timestamp: "2026-08-22T08:19:00.000Z", previousHash: h2, eventHash: h3, status: "VERIFIED" },
        { id: "aud-04", userId: "usr-operator-01", action: "VERIFICATION_PASSED", assetId: "ast-1001", jobId: "job-1001", timestamp: "2026-08-22T08:23:00.000Z", previousHash: h3, eventHash: h4, status: "VERIFIED" },
        { id: "aud-05", userId: "usr-admin-01", action: "CERTIFICATE_ISSUED", assetId: "ast-1001", jobId: null, timestamp: "2026-08-22T08:25:00.000Z", previousHash: h4, eventHash: h5, status: "VERIFIED" },
      ];

      this.state.notifications = [
        {
          id: "notif-01",
          userId: "usr-operator-01",
          title: "Wipe Job In Progress",
          message: "OptiPlex 7010 (APX-DT-2088) is currently at 58% sanitization progress.",
          type: "INFO",
          read: false,
          createdAt: "2026-08-24T08:15:00.000Z",
        },
        {
          id: "notif-02",
          userId: "usr-admin-01",
          title: "Certificate Generated",
          message: "Certificate ZT-2026-8F1A92 issued for Dell Latitude 7440.",
          type: "SUCCESS",
          read: true,
          createdAt: "2026-08-22T08:25:00.000Z",
        },
      ];

      this.state.invitations = [];

      this.save();
    }
  }

  // Record Audit Event
  public async recordAudit(userId: string | null, action: string, assetId: string | null, jobId: string | null, details: string) {
    const lastLog = this.state.auditLogs[this.state.auditLogs.length - 1];
    const previousHash = lastLog ? lastLog.eventHash : "GENESIS-0000000000000000000000000000";
    const timestamp = new Date().toISOString();
    const eventHash = generateEventHash(previousHash, action, assetId || jobId || "N/A", details, timestamp);

    const log = {
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      action,
      assetId,
      jobId,
      timestamp,
      previousHash,
      eventHash,
      status: "VERIFIED",
    };
    this.state.auditLogs.push(log);
    this.save();

    if (this.isPostgresAvailable) {
      try {
        let validAssetId = log.assetId;
        if (validAssetId) {
          const exists = await prisma.asset.findUnique({ where: { id: validAssetId } });
          if (!exists) validAssetId = null;
        }
        let validJobId = log.jobId;
        if (validJobId) {
          const exists = await prisma.wipeJob.findUnique({ where: { id: validJobId } });
          if (!exists) validJobId = null;
        }

        await prisma.auditLog.create({
          data: {
            id: log.id,
            userId: log.userId,
            action: log.action,
            assetId: validAssetId,
            jobId: validJobId,
            timestamp: new Date(log.timestamp),
            previousHash: log.previousHash,
            eventHash: log.eventHash,
            status: log.status,
          },
        });
      } catch (err: any) {
        console.warn("Audit log DB insert warning:", err.message);
      }
    }

    return log;
  }

  // Record Notification
  public async notify(userId: string, title: string, message: string, type: "SUCCESS" | "INFO" | "WARNING" | "CRITICAL") {
    const notif = {
      id: `notif-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.state.notifications.unshift(notif);
    this.save();

    if (this.isPostgresAvailable) {
      try {
        await prisma.notification.create({
          data: {
            id: notif.id,
            userId: notif.userId,
            title: notif.title,
            message: notif.message,
            type: notif.type as any,
            read: notif.read,
            createdAt: new Date(notif.createdAt),
          },
        });
      } catch (err: any) {
        console.warn("Notification DB insert warning:", err.message);
      }
    }

    return notif;
  }

  // User persistence methods
  public async saveUser(user: any) {
    const idx = this.state.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.state.users[idx] = { ...this.state.users[idx], ...user };
    } else {
      this.state.users.push(user);
    }
    this.save();

    if (this.isPostgresAvailable) {
      try {
        await prisma.user.upsert({
          where: { id: user.id },
          create: {
            id: user.id,
            fullName: user.fullName,
            email: user.email.toLowerCase(),
            passwordHash: user.passwordHash,
            role: user.role,
            organizationId: user.organizationId || null,
            department: user.department || null,
            status: user.status || "ACTIVE",
            emailVerified: Boolean(user.emailVerified),
            googleId: user.googleId || null,
            avatarUrl: user.avatarUrl || null,
            lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
          },
          update: {
            fullName: user.fullName,
            email: user.email.toLowerCase(),
            passwordHash: user.passwordHash,
            role: user.role,
            department: user.department || null,
            status: user.status,
            emailVerified: Boolean(user.emailVerified),
            googleId: user.googleId || null,
            avatarUrl: user.avatarUrl || null,
            lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
          },
        });
      } catch (err: any) {
        console.warn("User DB save warning:", err.message);
      }
    }
  }

  // Invitations persistence methods
  public getInvitations() {
    return this.state.invitations;
  }

  public async saveInvitation(invitation: any) {
    const idx = this.state.invitations.findIndex((i) => i.id === invitation.id);
    if (idx >= 0) {
      this.state.invitations[idx] = { ...this.state.invitations[idx], ...invitation };
    } else {
      this.state.invitations.unshift(invitation);
    }
    this.save();

    if (this.isPostgresAvailable) {
      try {
        await prisma.invitation.upsert({
          where: { id: invitation.id },
          create: {
            id: invitation.id,
            email: invitation.email.toLowerCase(),
            role: invitation.role,
            department: invitation.department || null,
            organizationId: invitation.organizationId || null,
            invitedById: invitation.invitedById,
            token: invitation.token,
            status: invitation.status,
            expiresAt: new Date(invitation.expiresAt),
          },
          update: {
            status: invitation.status,
            expiresAt: new Date(invitation.expiresAt),
          },
        });
      } catch (err: any) {
        console.warn("Invitation DB save warning:", err.message);
      }
    }
  }

  // Asset persistence methods
  public async saveAsset(asset: any) {
    const idx = this.state.assets.findIndex((a) => a.id === asset.id || a.assetId === asset.assetId);
    if (idx >= 0) {
      this.state.assets[idx] = { ...this.state.assets[idx], ...asset };
    } else {
      this.state.assets.unshift(asset);
    }
    this.save();

    if (this.isPostgresAvailable) {
      try {
        await prisma.asset.upsert({
          where: { id: asset.id },
          create: {
            id: asset.id,
            assetId: asset.assetId,
            customerId: asset.customerId || "usr-customer-01",
            organizationId: asset.organizationId || "org-apex-01",
            deviceType: asset.deviceType || "Laptop",
            manufacturer: asset.manufacturer || "Generic",
            model: asset.model || "Unknown",
            serialNumber: asset.serialNumber || `SN-${asset.id}`,
            storageType: asset.storageType || "SSD",
            storageCapacity: Number(asset.storageCapacity) || 512,
            operatingSystem: asset.operatingSystem || "Windows 11 Enterprise",
            encryptionStatus: asset.encryptionStatus || "Enabled",
            deviceHealth: asset.deviceHealth || "Good",
            owner: asset.owner || "Organization Staff",
            department: asset.department || "IT",
            location: asset.location || "Main Depository",
            condition: asset.condition || "Used",
            status: asset.status || "REGISTERED",
            createdAt: new Date(asset.createdAt || Date.now()),
            updatedAt: new Date(asset.updatedAt || Date.now()),
          },
          update: {
            status: asset.status,
            deviceHealth: asset.deviceHealth,
            encryptionStatus: asset.encryptionStatus,
            location: asset.location,
            updatedAt: new Date(asset.updatedAt || Date.now()),
          },
        });
      } catch (err: any) {
        console.warn("Asset DB save warning:", err.message);
      }
    }
  }

  // WipeJob persistence methods
  public async saveWipeJob(job: any) {
    const idx = this.state.wipeJobs.findIndex((j) => j.id === job.id || j.jobId === job.jobId);
    if (idx >= 0) {
      this.state.wipeJobs[idx] = { ...this.state.wipeJobs[idx], ...job };
    } else {
      this.state.wipeJobs.unshift(job);
    }
    this.save();

    if (this.isPostgresAvailable) {
      try {
        await prisma.wipeJob.upsert({
          where: { id: job.id },
          create: {
            id: job.id,
            jobId: job.jobId,
            assetId: job.assetId,
            operatorId: job.operatorId || "usr-operator-01",
            wipeMethod: job.wipeMethod || job.algorithm || "NIST SP 800-88 Purge",
            status: job.status || "PENDING",
            progress: Number(job.progress) || 0,
            startedAt: job.startedAt ? new Date(job.startedAt) : null,
            completedAt: job.completedAt ? new Date(job.completedAt) : null,
          },
          update: {
            status: job.status,
            progress: Number(job.progress),
            startedAt: job.startedAt ? new Date(job.startedAt) : undefined,
            completedAt: job.completedAt ? new Date(job.completedAt) : undefined,
          },
        });
      } catch (err: any) {
        console.warn("WipeJob DB save warning:", err.message);
      }
    }
  }

  // Verification persistence methods
  public async saveVerification(verif: any) {
    const idx = this.state.verificationResults.findIndex((v) => v.id === verif.id || v.verificationId === verif.verificationId);
    if (idx >= 0) {
      this.state.verificationResults[idx] = { ...this.state.verificationResults[idx], ...verif };
    } else {
      this.state.verificationResults.unshift(verif);
    }
    this.save();

    if (this.isPostgresAvailable) {
      try {
        await prisma.verificationResult.upsert({
          where: { id: verif.id },
          create: {
            id: verif.id,
            verificationId: verif.verificationId,
            wipeJobId: verif.wipeJobId || verif.jobId,
            assetId: verif.assetId,
            method: verif.method || "Full-Drive Sampling",
            blocksChecked: Number(verif.blocksChecked || verif.sectorsSampled) || 2048,
            residualDataResult: verif.residualDataResult || "Verified: 0% Residual Pattern Detected",
            confidenceScore: Math.round(Number(verif.confidenceScore)) || 99,
            status: verif.status || "PASSED",
            verifiedAt: verif.verifiedAt ? new Date(verif.verifiedAt) : null,
          },
          update: {
            status: verif.status,
            confidenceScore: Math.round(Number(verif.confidenceScore)) || 99,
            residualDataResult: verif.residualDataResult,
            verifiedAt: verif.verifiedAt ? new Date(verif.verifiedAt) : undefined,
          },
        });
      } catch (err: any) {
        console.warn("Verification DB save warning:", err.message);
      }
    }
  }

  // Certificate persistence methods
  public async saveCertificate(cert: any) {
    const idx = this.state.certificates.findIndex((c) => c.id === cert.id || c.certificateId === cert.certificateId);
    if (idx >= 0) {
      this.state.certificates[idx] = { ...this.state.certificates[idx], ...cert };
    } else {
      this.state.certificates.unshift(cert);
    }
    this.save();

    if (this.isPostgresAvailable) {
      try {
        await prisma.certificate.upsert({
          where: { id: cert.id },
          create: {
            id: cert.id,
            certificateId: cert.certificateId || cert.certificateNumber,
            assetId: cert.assetId,
            verificationId: cert.verificationId,
            wipeMethod: cert.wipeMethod || "NIST SP 800-88 Purge",
            verificationMethod: cert.verificationMethod || "Sampled Sector Read",
            operatorId: cert.operatorId || "usr-operator-01",
            certificateHash: cert.certificateHash || cert.hash,
            verificationCode: cert.verificationCode || `VCODE-${cert.id}`,
            qrData: cert.qrData || cert.qrCodeData || `https://zerotrace.ai/verify/${cert.certificateId}`,
            status: cert.status || "VALID",
            issuedAt: new Date(cert.issuedAt || Date.now()),
          },
          update: {
            status: cert.status,
          },
        });
      } catch (err: any) {
        console.warn("Certificate DB save warning:", err.message);
      }
    }
  }

  // RecyclingApproval persistence methods
  public async saveRecyclingApproval(approval: any) {
    const idx = this.state.recyclingApprovals.findIndex((r) => r.id === approval.id || r.assetId === approval.assetId);
    if (idx >= 0) {
      this.state.recyclingApprovals[idx] = { ...this.state.recyclingApprovals[idx], ...approval };
    } else {
      this.state.recyclingApprovals.unshift(approval);
    }
    this.save();

    if (this.isPostgresAvailable) {
      try {
        await prisma.recyclingApproval.upsert({
          where: { id: approval.id },
          create: {
            id: approval.id,
            assetId: approval.assetId,
            approvedBy: approval.approvedBy || "usr-admin-01",
            status: approval.status || "APPROVED",
            reason: approval.reason || "Sanitization verified with zero residual data.",
            approvedAt: new Date(approval.approvedAt || Date.now()),
          },
          update: {
            status: approval.status,
            reason: approval.reason,
          },
        });
      } catch (err: any) {
        console.warn("RecyclingApproval DB save warning:", err.message);
      }
    }
  }

  // Getters
  public getUsers() { return this.state.users; }
  public getOrganizations() { return this.state.organizations; }
  public getAssets() { return this.state.assets; }
  public getWipeJobs() { return this.state.wipeJobs; }
  public getVerifications() { return this.state.verificationResults; }
  public getCertificates() { return this.state.certificates; }
  public getAuditLogs() { return this.state.auditLogs; }
  public getNotifications(userId?: string) {
    if (userId) return this.state.notifications.filter((n) => n.userId === userId);
    return this.state.notifications;
  }
  public getRecyclingApprovals() { return this.state.recyclingApprovals; }

  // Setters / Mutators
  public saveChanges() { this.save(); }
}

export const dbStore = new DatabaseStore();
