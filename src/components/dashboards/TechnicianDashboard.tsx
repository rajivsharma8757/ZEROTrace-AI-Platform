import {
  Activity,
  CheckCircle2,
  FileCheck2,
  HardDrive,
  Leaf,
  Loader2,
  Play,
  PlayCircle,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Wrench,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared";
import { api } from "@/lib/api";
import type { AppData } from "@/lib/models";

function TechnicianMetric({
  icon: Icon,
  label,
  value,
  subtext,
  tone = "text-cyan-300",
  badge,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  subtext?: string;
  tone?: string;
  badge?: string;
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/70 shadow-sm hover:border-slate-700 transition">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className={`rounded-xl bg-slate-800/80 p-3.5 ${tone}`}>
            <Icon size={22} />
          </div>
          {badge && (
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono text-emerald-300">
              {badge}
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
          <p className="text-xs font-medium text-slate-300 mt-0.5">{label}</p>
          {subtext && <p className="text-[11px] text-slate-500 mt-1 truncate">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function TechnicianDashboard({
  data,
  stats,
  user,
  onRefresh,
}: {
  data: AppData;
  stats: any;
  user: any;
  onRefresh?: () => void;
}) {
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);

  // Scoped to technician
  const scopedDevices = data.devices.filter(
    (d) => d.assignedToId === user.id || !d.assignedToId || user.role === "ADMIN" || user.role === "OWNER"
  );
  const scopedJobs = data.wipeJobs.filter(
    (w) => w.operatorId === user.id || !w.operatorId || user.role === "ADMIN" || user.role === "OWNER"
  );

  const activeWipes = scopedJobs.filter((w) =>
    ["INITIALIZING", "DETECTING_STORAGE", "PREPARING_SANITIZATION", "SANITIZING", "FINALIZING"].includes(w.status)
  );
  const pendingJobs = scopedJobs.filter((w) => w.status === "PENDING");
  const pendingVerifs = data.verifications.filter((v) => v.status === "PENDING" || v.result === "PENDING");
  const completedJobs = scopedJobs.filter((w) => w.status === "COMPLETED");

  const handleStart = async (jobId: string) => {
    setLoadingJobId(jobId);
    try {
      await api.wipeJobs.start(jobId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to start wipe job:", err);
    } finally {
      setLoadingJobId(null);
    }
  };

  const handleAdvance = async (jobId: string) => {
    setLoadingJobId(jobId);
    try {
      await api.wipeJobs.advance(jobId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to advance wipe job:", err);
    } finally {
      setLoadingJobId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Technician Workbench Banner */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/30 p-6 md:p-8 relative overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-mono font-semibold text-emerald-300 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-emerald-400" /> SANITIZATION ENGINEERING WORKBENCH
              </span>
              <span className="rounded-md bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 text-xs font-mono font-semibold text-cyan-300">
                NIST SP 800-88 PURGE & CLEAR
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Sanitization Engineering & Hardware Workbench
            </h1>
            <p className="mt-1.5 max-w-3xl text-sm text-slate-300 leading-relaxed">
              Execute simulated hardware sanitization protocols, advance multi-pass overwrite phases, record
              firmware block erasures, and submit cryptographic proof records for auditor sign-off.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh Workbench
              </Button>
            )}
            <Button asChild className="bg-emerald-400 font-semibold text-slate-950 hover:bg-emerald-300">
              <Link to="/wipe-jobs">
                <Play className="mr-2 h-4 w-4" /> Open Operations
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Technician KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <TechnicianMetric
          icon={HardDrive}
          label="Assigned Hardware"
          value={scopedDevices.length}
          subtext="In technician queue"
          tone="text-slate-200"
          badge="QUEUE"
        />
        <TechnicianMetric
          icon={Activity}
          label="Active Wipes"
          value={activeWipes.length}
          subtext="Simulations running"
          tone="text-cyan-300"
          badge="EXECUTING"
        />
        <TechnicianMetric
          icon={ShieldAlert}
          label="Pending Start"
          value={pendingJobs.length}
          subtext="Awaiting initiation"
          tone="text-amber-300"
          badge="INTAKE"
        />
        <TechnicianMetric
          icon={CheckCircle2}
          label="Verification Queue"
          value={pendingVerifs.length}
          subtext="Completed; pending review"
          tone="text-blue-300"
          badge="REVIEW"
        />
        <TechnicianMetric
          icon={FileCheck2}
          label="Sanitized Units"
          value={completedJobs.length}
          subtext="Passed zero-residual test"
          tone="text-emerald-300"
          badge="CLEARED"
        />
        <TechnicianMetric
          icon={Leaf}
          label="Recycling Ready"
          value={data.devices.filter((d) => d.status === "READY_FOR_RECYCLING").length}
          subtext="Cleared for disposition"
          tone="text-violet-300"
          badge="CIRCULAR"
        />
      </div>

      {/* Active Workbench Interactive Cards */}
      <Card className="border-slate-800 bg-slate-900/70">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" /> Active Sanitization Workbench
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Advance running jobs phase-by-phase or initiate queued hardware erasures directly.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="border-slate-700 bg-slate-800/40 text-slate-200">
              <Link to="/wipe-jobs">All Wipe Operations →</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {scopedJobs.slice(0, 4).map((j) => {
              const device = data.devices.find((d) => d.id === j.deviceId || d.assetId === j.assetId || d.id === j.assetId);
              const isActive = ["INITIALIZING", "DETECTING_STORAGE", "PREPARING_SANITIZATION", "SANITIZING", "FINALIZING"].includes(j.status);
              const isPending = j.status === "PENDING";
              const isDone = j.status === "COMPLETED";

              const deviceLabel = device
                ? (device.make ? `${device.make} ${device.model || ""}` : (device.name || device.model || "Target Storage Media")).trim()
                : "Target Storage Media";

              return (
                <div key={j.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">{j.jobId}</span>
                        <StatusBadge value={j.status} />
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-1">
                        {deviceLabel}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        SN: {device?.serialNumber || "N/A"} • {device?.storageType || "SSD"} • {device?.capacityGb || 512} GB
                      </p>
                    </div>

                    <div>
                      {isPending && (
                        <Button
                          size="sm"
                          disabled={loadingJobId === j.id}
                          className="bg-cyan-500 font-semibold text-slate-950 hover:bg-cyan-400 text-xs"
                          onClick={() => handleStart(j.id)}
                        >
                          {loadingJobId === j.id ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Play className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Start Wipe
                        </Button>
                      )}

                      {isActive && (
                        <Button
                          size="sm"
                          disabled={loadingJobId === j.id}
                          className="bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300 text-xs"
                          onClick={() => handleAdvance(j.id)}
                        >
                          {loadingJobId === j.id ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Advance (+20%)
                        </Button>
                      )}

                      {isDone && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
                          <CheckCircle2 size={13} /> Sanitized
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress & Phase Bar */}
                  <div>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">Phase: {j.phase || "Initializing"}</span>
                      <span className="font-mono text-cyan-300 font-bold">{j.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-900 border border-slate-800">
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

            {scopedJobs.length === 0 && (
              <div className="col-span-2 text-center py-10">
                <p className="text-xs text-slate-400">No wipe operations currently assigned.</p>
                <Button asChild size="sm" className="mt-3 bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs">
                  <Link to="/devices">Select Device to Wipe</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* NIST SP 800-88 Standard Operating Procedure (SOP) Quick Reference */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-xs">1. NIST Clear (Logical Overwrite)</span>
              <span className="rounded bg-cyan-500/10 text-cyan-300 px-2 py-0.5 text-[10px] font-mono">
                PASS 1
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Logical overwrite of all user-addressable LBAs with fixed pseudo-random patterns (0x00, 0xFF, random byte values).
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-xs">2. NIST Purge (Cryptographic Erase)</span>
              <span className="rounded bg-emerald-500/10 text-emerald-300 px-2 py-0.5 text-[10px] font-mono">
                PASS 2
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Issues ATA/NVMe Sanitize Crypto Erase command to permanently destroy encryption keys and flash translation layers.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-xs">3. Residual Verification</span>
              <span className="rounded bg-purple-500/10 text-purple-300 px-2 py-0.5 text-[10px] font-mono">
                PASS 3
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Statistical pseudo-random sector sampling (2048 blocks) confirming 0% residual pattern presence across media.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Technician Quick Actions */}
      <Card className="border-slate-800 bg-slate-900/70">
        <CardContent className="p-6">
          <h2 className="font-semibold text-white">Technician Operations Shortcuts</h2>
          <p className="mt-0.5 text-xs text-slate-400">Direct workbench navigation.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Button asChild className="w-full justify-start bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-medium text-xs">
              <Link to="/wipe-jobs">
                <Play className="mr-2 h-4 w-4" /> Operations Terminal
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/devices">
                <HardDrive className="mr-2 h-4 w-4 text-cyan-300" /> Device Diagnostics
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/verification">
                <CheckCircle2 className="mr-2 h-4 w-4 text-blue-300" /> Submit Proof
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/certificates">
                <FileCheck2 className="mr-2 h-4 w-4 text-purple-300" /> Completed Certs
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
