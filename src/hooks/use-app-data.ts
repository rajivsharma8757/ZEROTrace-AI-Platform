import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getData, saveData, audit as localAudit, id as localId } from "@/lib/data";
import type { AppData, Device, WipeJob, Verification, Certificate, AuditEvent, RecyclingApproval, Notification } from "@/lib/models";

export function useAppData() {
  const [data, setData] = useState<AppData>(() => getData());
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Sync state from backend API
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch in parallel with error tolerance
      const [
        assetsRes,
        wipeJobsRes,
        verificationsRes,
        certsRes,
        auditRes,
        recyclingRes,
        notesRes,
      ] = await Promise.allSettled([
        api.assets.getAssets(),
        api.wipeJobs.getWipeJobs(),
        api.verification.getVerifications(),
        api.certificates.getCertificates(),
        api.audit.getAuditLogs(),
        api.recycling.getStatus(),
        api.notifications.getNotifications(),
      ]);

      const local = getData();

      // Map assets to devices
      let devices: Device[] = local.devices;
      if (assetsRes.status === "fulfilled" && assetsRes.value.success && assetsRes.value.data) {
        devices = assetsRes.value.data.map((a: any) => ({
          id: a.id,
          assetId: a.assetTag || a.assetId || a.id,
          name: a.model ? `${a.make || ""} ${a.model}`.trim() : a.name || a.assetTag,
          type: a.deviceType || a.type || "Laptop",
          serialNumber: a.serialNumber || "N/A",
          operatingSystem: a.operatingSystem || "Windows 11 Pro",
          storageType: (a.storageType || "SSD") as Device["storageType"],
          capacityGb: Number(a.storageCapacityGb || a.capacityGb || 512),
          encryption: a.isEncrypted !== undefined ? (a.isEncrypted ? "Enabled" : "Disabled") : (a.encryption || "Enabled"),
          health: (a.health || (a.condition === "POOR" ? "Attention" : a.condition === "FAIR" ? "Good" : "Excellent")) as Device["health"],
          status: a.status || "REGISTERED",
          ownerId: a.assignedUserId || a.ownerId || "usr-customer",
          assignedToId: a.assignedUserId || a.assignedToId || "usr-operator",
          createdAt: a.createdAt || new Date().toISOString(),
        }));
      }

      // Map wipe jobs
      let wipeJobs: WipeJob[] = local.wipeJobs;
      if (wipeJobsRes.status === "fulfilled" && wipeJobsRes.value.success && wipeJobsRes.value.data) {
        wipeJobs = wipeJobsRes.value.data.map((w: any) => ({
          id: w.id,
          deviceId: w.assetId || w.deviceId,
          assetId: w.assetId,
          operatorId: w.operatorId,
          method: w.wipeMethod || w.method || "NIST 800-88 Purge",
          securityLevel: w.securityLevel || "High",
          estimatedMinutes: w.estimatedMinutes || 20,
          status: w.status,
          progress: w.progressPercent !== undefined ? w.progressPercent : (w.progress || 0),
          phase: w.currentPhase || w.phase || "Queued",
          currentPass: w.currentPass || 1,
          totalPasses: w.totalPasses || 1,
          createdAt: w.startedAt || w.createdAt || new Date().toISOString(),
          completedAt: w.completedAt,
        }));
      }

      // Map verifications
      let verifications: Verification[] = local.verifications;
      if (verificationsRes.status === "fulfilled" && verificationsRes.value.success && verificationsRes.value.data) {
        verifications = verificationsRes.value.data.map((v: any) => ({
          id: v.id,
          deviceId: v.assetId || v.deviceId,
          assetId: v.assetId,
          wipeJobId: v.wipeJobId,
          method: v.verificationMethod || v.method || "Sampled Read Verification",
          result: v.status === "PASSED" ? "PASS" : v.status === "FAILED" ? "FAIL" : (v.result || "PENDING"),
          evidence: v.evidenceHash ? `Cryptographic hash ${v.evidenceHash.slice(0, 16)}... confirmed.` : (v.notes || v.evidence || "Evidence recorded."),
          verifiedAt: v.verifiedAt,
          verifierId: v.verifiedByUserId || v.verifierId,
        }));
      }

      // Map certificates
      let certificates: Certificate[] = local.certificates;
      if (certsRes.status === "fulfilled" && certsRes.value.success && certsRes.value.data) {
        certificates = certsRes.value.data.map((c: any) => ({
          id: c.certificateNumber || c.id,
          certificateNumber: c.certificateNumber,
          deviceId: c.assetId || c.deviceId,
          assetId: c.assetId,
          verificationId: c.verificationResultId || c.verificationId,
          hash: c.certificateHash || c.hash || "ZT-HASH",
          status: c.status || "VALID",
          issuedAt: c.issuedAt || new Date().toISOString(),
          issuedBy: c.issuedByUserId || c.issuedBy || "usr-admin",
          qrCodeUrl: c.qrCodeUrl,
        }));
      }

      // Map audit logs
      let auditEvents: AuditEvent[] = local.auditEvents;
      if (auditRes.status === "fulfilled" && auditRes.value.success && auditRes.value.data) {
        auditEvents = auditRes.value.data.map((a: any) => ({
          id: a.id,
          action: a.action,
          actorId: a.userId || a.actorId || "SYSTEM",
          entityType: a.entityType || "SYSTEM",
          entityId: a.entityId || a.id,
          details: a.details || a.action,
          timestamp: a.timestamp || a.createdAt || new Date().toISOString(),
          previousHash: a.previousHash || "GENESIS",
          currentHash: a.currentHash || a.hash || "ZT-HASH",
        }));
      }

      // Map recycling
      let recyclingApprovals: RecyclingApproval[] = local.recyclingApprovals;
      if (recyclingRes.status === "fulfilled" && recyclingRes.value.success && recyclingRes.value.approvals) {
        recyclingApprovals = recyclingRes.value.approvals.map((r: any) => ({
          id: r.id,
          deviceId: r.assetId || r.deviceId,
          assetId: r.assetId,
          status: r.status,
          approverId: r.approvedByUserId || r.approverId,
          approvedAt: r.approvedAt,
          notes: r.decisionNotes || r.reason || r.notes || "Approved for certified recycling",
        }));
      }

      // Map notifications
      let notifications: Notification[] = local.notifications;
      if (notesRes.status === "fulfilled" && notesRes.value.success && notesRes.value.data) {
        notifications = notesRes.value.data.map((n: any) => ({
          id: n.id,
          userId: n.userId,
          title: n.title,
          body: n.message || n.body || "",
          message: n.message,
          read: n.isRead !== undefined ? n.isRead : (n.read ?? false),
          isRead: n.isRead !== undefined ? n.isRead : (n.read ?? false),
          type: n.type || "INFO",
          createdAt: n.createdAt || new Date().toISOString(),
        }));
      }

      const merged: AppData = {
        organizations: local.organizations,
        users: local.users,
        devices,
        wipeJobs,
        verifications,
        certificates,
        auditEvents,
        recyclingApprovals,
        notifications,
      };

      setData(merged);
      saveData(merged);
      setLastSync(new Date());
    } catch (err) {
      console.warn("API refresh fallback to local cache:", err);
      setData(getData());
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback((mutate: (d: AppData) => void) => {
    const next = getData();
    mutate(next);
    saveData(next);
    setData(next);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 8000); // Periodic live polling for real-time background job updates
    return () => clearInterval(interval);
  }, [refresh]);

  return { data, update, refresh, loading, lastSync };
}
