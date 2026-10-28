import {
  AlertTriangle,
  Play,
  Plus,
  RefreshCw,
  CheckCircle2,
  HardDrive,
  Cpu,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, StatusBadge } from "@/components/shared";
import { useAppData } from "@/hooks/use-app-data";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { recommendation } from "@/lib/data";

const phases = [
  ["INITIALIZING", "Initializing Engine"],
  ["DETECTING_STORAGE", "Detecting Drive Geometry & Firmware"],
  ["PREPARING_SANITIZATION", "Setting NIST Overwrite Buffer"],
  ["SANITIZING", "Executing Cryptographic Sanitization"],
  ["FINALIZING", "Flushing Disk Cache & Calculating Checksums"],
  ["VERIFICATION_PREPARATION", "Ready for Verification Review"],
] as const;

export default function WipeJobs() {
  const { data, refresh, update } = useAppData();
  const { user } = useAuth();
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);

  const isCustomer = user?.role === "CUSTOMER";

  // Eligible assets that do not currently have an active wipe job
  const availableDevices = data.devices.filter(
    (d) =>
      !data.wipeJobs.some((w) => (w.deviceId === d.id || w.assetId === d.id) && w.status !== "COMPLETED") &&
      !["READY_FOR_RECYCLING", "CERTIFIED", "RECYCLED"].includes(d.status)
  );

  const handleCreateJob = async (deviceId: string) => {
    const device = data.devices.find((x) => x.id === deviceId);
    if (!device) return;

    setLoadingJobId(deviceId);
    try {
      const rec = recommendation(device as any);
      const res = await api.wipeJobs.createWipeJob({
        assetId: device.id,
        wipeMethod: rec.method,
      });

      if (res.success) {
        await refresh();
        setLoadingJobId(null);
        return;
      }
    } catch (err: any) {
      console.warn("API create wipe job fallback to local store:", err?.message || err);
    }

    // Local fallback
    const rec = recommendation(device as any);
    const newJobId = `wipe-${Date.now().toString(36)}`;
    update((x) => {
      const dev = x.devices.find((q) => q.id === deviceId);
      if (dev) dev.status = "WIPE_PENDING";
      x.wipeJobs.unshift({
        id: newJobId,
        deviceId,
        assetId: device.id,
        operatorId: user?.id || "usr-operator",
        method: rec.method,
        securityLevel: rec.security,
        estimatedMinutes: rec.duration,
        status: "PENDING",
        progress: 0,
        phase: "Queued",
        createdAt: new Date().toISOString(),
      });
    });

    setLoadingJobId(null);
  };

  const handleStart = async (jobId: string) => {
    setLoadingJobId(jobId);
    try {
      const res = await api.wipeJobs.startWipeJob(jobId);
      if (res.success) {
        await refresh();
        setLoadingJobId(null);
        return;
      }
    } catch (err) {
      console.warn("API start wipe job fallback:", err);
    }

    // Local fallback
    update((x) => {
      const job = x.wipeJobs.find((w) => w.id === jobId);
      if (!job) return;
      const device = x.devices.find((d) => d.id === job.deviceId || d.id === job.assetId);
      job.status = "INITIALIZING";
      job.phase = "Initializing";
      if (device) device.status = "WIPING";
    });
    setLoadingJobId(null);
  };

  const handleAdvance = async (jobId: string) => {
    setLoadingJobId(jobId);
    try {
      const res = await api.wipeJobs.advanceWipeJob(jobId);
      if (res.success) {
        await refresh();
        setLoadingJobId(null);
        return;
      }
    } catch (err) {
      console.warn("API advance wipe job fallback:", err);
    }

    // Local fallback
    update((x) => {
      const j = x.wipeJobs.find((w) => w.id === jobId);
      if (!j) return;
      const d = x.devices.find((q) => q.id === j.deviceId || q.id === j.assetId);
      const nextProgress = Math.min(100, (j.progress || 0) + 20);
      j.progress = nextProgress;

      const idx = Math.min(phases.length - 1, Math.floor(nextProgress / 18));
      if (nextProgress >= 100) {
        j.status = "COMPLETED";
        j.phase = "Ready for Verification";
        j.completedAt = new Date().toISOString();
        if (d) d.status = "VERIFICATION_PENDING";

        // Queue verification record
        const verId = `ver-${Date.now().toString(36)}`;
        x.verifications.unshift({
          id: verId,
          deviceId: d ? d.id : j.deviceId,
          wipeJobId: j.id,
          method: "Cryptographic + Sampled Read Verification",
          result: "PENDING",
          evidence: "Sanitization simulation finished. 32 sample sectors ready for verification.",
        });
      } else {
        j.status = phases[idx][0];
        j.phase = phases[idx][1];
      }
    });

    setLoadingJobId(null);
  };

  return (
    <>
      <PageHeader
        title="Sanitization Engine & Wipe Operations"
        description="Monitor multi-pass data destruction routines compliant with NIST SP 800-88 Rev. 2 and DoD 5220.22-M."
      />

      {/* Simulation Banner */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-300">Demonstration & Safe Simulation Mode</p>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            This platform simulates data overwriting, firmware sanitization, and cryptographic erasure workflows.
            Zero destructive hardware writes or raw disk commands are executed on the host system.
          </p>
        </div>
      </div>

      {/* Create New Wipe Job Section */}
      {!isCustomer && (
        <Card className="mb-6 border-slate-800 bg-slate-900/60">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-white">Queue Device for Sanitization</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Select an intake-verified device to initialize its explainable wipe routine.
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {availableDevices.map((d) => (
                <Button
                  key={d.id}
                  variant="outline"
                  size="sm"
                  disabled={loadingJobId === d.id}
                  className="border-slate-700 bg-slate-800/40 text-slate-200 hover:border-cyan-400 hover:text-white"
                  onClick={() => handleCreateJob(d.id)}
                >
                  {loadingJobId === d.id ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-cyan-300" />
                  ) : (
                    <Plus className="mr-1.5 h-3.5 w-3.5 text-cyan-300" />
                  )}
                  {d.assetId} ({d.name})
                </Button>
              ))}

              {availableDevices.length === 0 && (
                <span className="text-xs text-slate-400 py-1">
                  All registered inventory items are currently in progress or already certified.
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Jobs Queue */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardContent className="p-0">
          <div className="border-b border-slate-800 p-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white text-base">Sanitization Operations Queue</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time status of active and queued jobs</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => refresh()} className="text-slate-400 hover:text-white">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
            </Button>
          </div>

          <div className="divide-y divide-slate-800/70">
            {data.wipeJobs.map((j) => {
              const d = data.devices.find((q) => q.id === j.deviceId || q.id === j.assetId);
              const isActive = !["PENDING", "COMPLETED", "FAILED"].includes(j.status);
              const isDone = j.status === "COMPLETED";

              return (
                <div className="p-6 transition hover:bg-slate-800/20" key={j.id}>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <HardDrive size={18} className="text-cyan-400" />
                        <h3 className="font-semibold text-white text-base">
                          {d ? d.assetId : "Unknown Asset"} · {d ? d.name : "Device"}
                        </h3>
                        <StatusBadge value={j.status} />
                      </div>
                      <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-3">
                        <span className="font-medium text-slate-300">{j.method}</span>
                        <span>•</span>
                        <span>Level: <b className="text-cyan-300 font-normal">{j.securityLevel || "High"}</b></span>
                        <span>•</span>
                        <span>Estimated: ~{j.estimatedMinutes || 20} mins</span>
                      </p>
                    </div>

                    {/* Action Controls */}
                    {!isCustomer && (
                      <div className="flex items-center gap-2">
                        {j.status === "PENDING" && (
                          <Button
                            size="sm"
                            disabled={loadingJobId === j.id}
                            className="bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300"
                            onClick={() => handleStart(j.id)}
                          >
                            {loadingJobId === j.id ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Play className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            Start Sanitization
                          </Button>
                        )}

                        {isActive && (
                          <Button
                            size="sm"
                            disabled={loadingJobId === j.id}
                            className="bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300"
                            onClick={() => handleAdvance(j.id)}
                          >
                            {loadingJobId === j.id ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            Advance Phase (+20%)
                          </Button>
                        )}

                        {isDone && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-lg">
                            <CheckCircle2 size={14} /> Ready for Verification
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar & Stage Indicator */}
                  <div className="mt-5">
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Phase: {j.phase || "Initializing"}</span>
                      <span className="font-mono text-cyan-300 font-bold">{j.progress}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-950 border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDone ? "bg-emerald-400" : "bg-cyan-400"
                        }`}
                        style={{ width: `${j.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {data.wipeJobs.length === 0 && (
              <div className="py-16 text-center text-sm text-slate-400">
                No sanitization jobs have been created yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
