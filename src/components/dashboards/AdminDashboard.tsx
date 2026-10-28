import {
  Activity,
  CheckCircle2,
  FileCheck2,
  HardDrive,
  Leaf,
  Play,
  PlayCircle,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Users,
  FileSpreadsheet,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared";
import type { AppData } from "@/lib/models";

const chartColors: Record<string, string> = {
  REGISTERED: "bg-slate-500",
  WIPE_PENDING: "bg-amber-400",
  WIPING: "bg-cyan-400",
  VERIFICATION_PENDING: "bg-sky-400",
  VERIFIED: "bg-blue-400",
  CERTIFIED: "bg-emerald-400",
  READY_FOR_RECYCLING: "bg-violet-400",
  RECYCLED: "bg-emerald-600",
  FAILED: "bg-rose-400",
};

function OperationalMetric({
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
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
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

export function AdminDashboard({
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
  const totalAssetsCount = stats?.totalAssets ?? data.devices.length;
  const activeWipes = data.wipeJobs.filter((w) =>
    ["INITIALIZING", "DETECTING_STORAGE", "PREPARING_SANITIZATION", "SANITIZING", "FINALIZING"].includes(w.status)
  );
  const activeWipesCount = stats?.activeWipes ?? activeWipes.length;
  const pendingVerifsCount = data.verifications.filter((v) => v.status === "PENDING" || v.result === "PENDING").length;
  const totalCertificatesCount = stats?.totalCertificates ?? data.certificates.length;
  const readyRecyclingCount =
    stats?.readyForRecycling ??
    data.devices.filter((d) => d.status === "READY_FOR_RECYCLING" || d.status === "RECYCLED").length;

  const statuses = Object.entries(
    data.devices.reduce(
      (a, d) => ({ ...a, [d.status]: (a[d.status] ?? 0) + 1 }),
      {} as Record<string, number>
    )
  );

  return (
    <div className="space-y-6">
      {/* Admin Operations Banner */}
      <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/30 p-6 md:p-8 relative overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-md bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 text-xs font-mono font-semibold text-purple-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" /> OPERATIONAL DIRECTORATE
              </span>
              <span className="rounded-md bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 text-xs font-mono font-semibold text-cyan-300">
                DISPATCH & INTAKE ACTIVE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Operations Directorate & Asset Logistics
            </h1>
            <p className="mt-1.5 max-w-3xl text-sm text-slate-300 leading-relaxed">
              Supervise hardware intake processing, dispatch simulated multi-pass wiping jobs, inspect verification
              queues, issue cryptographic certificates, and prepare verified assets for downstream recycling.
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
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
              </Button>
            )}
            <Button asChild className="bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300">
              <Link to="/devices">
                <HardDrive className="mr-2 h-4 w-4" /> Register New Batch
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Operational KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <OperationalMetric
          icon={HardDrive}
          label="Total Managed Assets"
          value={totalAssetsCount}
          subtext="In active disposition"
          tone="text-slate-200"
          badge="TOTAL"
        />
        <OperationalMetric
          icon={Activity}
          label="Active Sanitizations"
          value={activeWipesCount}
          subtext="NIST SP 800-88 running"
          tone="text-cyan-300"
          badge="IN PROGRESS"
        />
        <OperationalMetric
          icon={CheckCircle2}
          label="Pending Verifications"
          value={pendingVerifsCount}
          subtext="Awaiting proof sign-off"
          tone="text-amber-300"
          badge="INSPECTION"
        />
        <OperationalMetric
          icon={FileCheck2}
          label="Certificates Issued"
          value={totalCertificatesCount}
          subtext="Tamper-evident seals"
          tone="text-emerald-300"
          badge="VALIDATED"
        />
        <OperationalMetric
          icon={Leaf}
          label="Recycling Pipeline"
          value={readyRecyclingCount}
          subtext="Cleared for e-waste stream"
          tone="text-violet-300"
          badge="RECYCLE"
        />
        <OperationalMetric
          icon={ShieldCheck}
          label="Compliance Rate"
          value="99.8%"
          subtext="NIST 800-88 Purge/Clear"
          tone="text-emerald-400"
          badge="AUDITED"
        />
      </div>

      {/* Operational Pipeline & Active Jobs Monitor */}
      <div className="grid gap-6 xl:grid-cols-5">
        {/* Asset Disposition Funnel */}
        <Card className="border-slate-800 bg-slate-900/70 xl:col-span-3">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-400" /> Asset Disposition Funnel
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Current distribution of assets across the complete sanitization journey.
                </p>
              </div>
              <span className="rounded-full bg-purple-400/10 border border-purple-400/20 px-3 py-1 text-xs font-mono text-purple-300">
                {data.devices.length} Units Under Custody
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {statuses.map(([status, count]) => (
                <div key={status}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{status.replaceAll("_", " ")}</span>
                    <span className="text-slate-400 font-mono">
                      {count} ({Math.round((count / Math.max(data.devices.length, 1)) * 100)}%)
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-950 border border-slate-800">
                    <div
                      className={`h-full rounded-full ${chartColors[status] ?? "bg-slate-500"} transition-all duration-500`}
                      style={{ width: `${(count / Math.max(data.devices.length, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {statuses.length === 0 && (
                <p className="text-center py-8 text-sm text-slate-400">No assets currently registered.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Wipe Jobs Flight Monitor */}
        <Card className="border-slate-800 bg-slate-900/70 xl:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-white">Active Wipe Operations</h2>
                <p className="mt-0.5 text-xs text-slate-400">Live wiping progress and technician dispatch.</p>
              </div>
              <Button asChild size="sm" variant="outline" className="border-slate-700 bg-slate-800/40 text-slate-200">
                <Link to="/wipe-jobs">All Jobs</Link>
              </Button>
            </div>

            <div className="space-y-3">
              {activeWipes.slice(0, 4).map((j) => (
                <div key={j.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-300">{j.jobId}</span>
                    <span className="text-xs font-mono font-semibold text-slate-300">{j.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-900 border border-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                      style={{ width: `${j.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Phase: {j.phase || "Sanitizing"}</span>
                    <span>Algorithm: NIST SP 800-88</span>
                  </div>
                </div>
              ))}
              {activeWipes.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400">No active wipe operations in flight.</p>
                  <Button asChild size="sm" className="mt-3 bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs">
                    <Link to="/wipe-jobs">Launch New Job</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Quick Action Launchpad */}
      <Card className="border-slate-800 bg-slate-900/70">
        <CardContent className="p-6">
          <h2 className="font-semibold text-white">Operations Command Launchpad</h2>
          <p className="mt-0.5 text-xs text-slate-400">Shortcuts to daily operational workflows.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <Button asChild className="w-full justify-start bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-medium text-xs">
              <Link to="/devices">
                <HardDrive className="mr-2 h-4 w-4" /> Intake Assets
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/wipe-jobs">
                <PlayCircle className="mr-2 h-4 w-4 text-cyan-300" /> Start Sanitization
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/verification">
                <CheckCircle2 className="mr-2 h-4 w-4 text-amber-300" /> Review Proofs
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/certificates">
                <FileCheck2 className="mr-2 h-4 w-4 text-emerald-300" /> Certificates
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/recycling">
                <Leaf className="mr-2 h-4 w-4 text-violet-300" /> Recycling Clearance
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/reports">
                <FileSpreadsheet className="mr-2 h-4 w-4 text-blue-300" /> Export Reports
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Operational Events Feed */}
      <Card className="border-slate-800 bg-slate-900/70">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-400" /> Recent Operational Activity
            </h2>
            <Link to="/audit-log" className="text-xs text-purple-300 hover:underline">
              View full ledger →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-800/80">
            {data.auditEvents
              .slice(-5)
              .reverse()
              .map((e) => (
                <div className="flex items-start gap-3 py-3 text-sm" key={e.id}>
                  <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400 mt-0.5 shrink-0">
                    <Activity size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-200 font-medium text-xs sm:text-sm">
                      <span className="font-semibold text-purple-300">{e.action.replaceAll("_", " ")}</span>{" "}
                      <span className="text-slate-400 font-normal">— {e.details}</span>
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span>{new Date(e.timestamp).toLocaleString()}</span>
                      <span className="font-mono text-[11px] text-purple-400/80">
                        HASH: {e.currentHash ? e.currentHash.slice(0, 18) : "N/A"}...
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
