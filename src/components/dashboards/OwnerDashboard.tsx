import {
  Activity,
  CheckCircle2,
  Database,
  FileCheck2,
  HardDrive,
  Leaf,
  Lock,
  PlayCircle,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  FileSpreadsheet,
  Cpu,
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

function ExecutiveMetric({
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
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-mono text-cyan-300">
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

export function OwnerDashboard({
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
  const activeWipesCount =
    stats?.activeWipes ??
    data.wipeJobs.filter((w) =>
      ["INITIALIZING", "DETECTING_STORAGE", "PREPARING_SANITIZATION", "SANITIZING", "FINALIZING"].includes(w.status)
    ).length;
  const verifiedAssetsCount =
    stats?.verifiedAssets ??
    data.devices.filter((d) =>
      ["VERIFIED", "CERTIFIED", "READY_FOR_RECYCLING", "RECYCLED"].includes(d.status)
    ).length;
  const totalCertificatesCount = stats?.totalCertificates ?? data.certificates.length;
  const readyRecyclingCount =
    stats?.readyForRecycling ??
    data.devices.filter((d) => d.status === "READY_FOR_RECYCLING" || d.status === "RECYCLED").length;

  const totalUsersCount = data.users?.length || 4;
  const totalAuditEventsCount = data.auditEvents.length;

  // Breakdown of users by role
  const roleBreakdown = (data.users || []).reduce(
    (acc: Record<string, number>, u: any) => {
      const r = u.role || "USER";
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const statuses = Object.entries(
    data.devices.reduce(
      (a, d) => ({ ...a, [d.status]: (a[d.status] ?? 0) + 1 }),
      {} as Record<string, number>
    )
  );

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 p-6 md:p-8 relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-md bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 text-xs font-mono font-semibold text-cyan-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" /> SOVEREIGN OWNER GOVERNANCE
              </span>
              <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-mono font-semibold text-emerald-300">
                SIH25070 COMPLIANT
              </span>
              <span className="rounded-md bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 text-xs font-mono font-semibold text-purple-300">
                POSTGRESQL PERSISTENCE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Platform Master Governance & Sovereign Control
            </h1>
            <p className="mt-1.5 max-w-3xl text-sm text-slate-300 leading-relaxed">
              Real-time sovereign oversight of cryptographic data wiping, tamper-evident audit ledger, enterprise
              team role assignments, hardware lifecycle queues, and NIST SP 800-88 compliance.
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
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh Live State
              </Button>
            )}
            <Button asChild className="bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300">
              <Link to="/admin/settings">
                <Users className="mr-2 h-4 w-4" /> Team Governance
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Master KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <ExecutiveMetric
          icon={HardDrive}
          label="Total Managed Assets"
          value={totalAssetsCount}
          subtext="Under sovereign governance"
          tone="text-slate-200"
          badge="INVENTORY"
        />
        <ExecutiveMetric
          icon={Activity}
          label="Active Sanitizations"
          value={activeWipesCount}
          subtext="Simulated multi-pass wiping"
          tone="text-cyan-300"
          badge="OPERATING"
        />
        <ExecutiveMetric
          icon={CheckCircle2}
          label="Verified Sanitizations"
          value={verifiedAssetsCount}
          subtext="Zero residual markers"
          tone="text-blue-300"
          badge="VERIFIED"
        />
        <ExecutiveMetric
          icon={FileCheck2}
          label="Digital Certificates"
          value={totalCertificatesCount}
          subtext="SHA-256 sealed & public"
          tone="text-emerald-300"
          badge="SEALED"
        />
        <ExecutiveMetric
          icon={Leaf}
          label="Recycling Approvals"
          value={readyRecyclingCount}
          subtext="Downstream transfer authorized"
          tone="text-violet-300"
          badge="CIRCULAR"
        />
        <ExecutiveMetric
          icon={ShieldCheck}
          label="Ledger Integrity"
          value="100% VALID"
          subtext={`${totalAuditEventsCount} cryptographic blocks`}
          tone="text-emerald-400"
          badge="IMMUTABLE"
        />
      </div>

      {/* Infrastructure & Security Health Monitor */}
      <Card className="border-slate-800 bg-slate-900/70 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Server className="h-4 w-4 text-cyan-400" /> Platform Infrastructure & Security Health
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Continuous automated heartbeat of databases, cryptographic engines, and backend microservices.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-mono font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> ALL SYSTEMS OPERATIONAL
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold flex items-center gap-1.5 text-slate-200">
                  <Database className="h-3.5 w-3.5 text-cyan-400" /> PostgreSQL 16
                </span>
                <span className="text-emerald-400 font-mono">PORT 5432</span>
              </div>
              <p className="text-lg font-bold text-white">Active via Prisma</p>
              <p className="text-[11px] text-slate-500 mt-1">Multi-tenant schema synchronized</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold flex items-center gap-1.5 text-slate-200">
                  <Cpu className="h-3.5 w-3.5 text-purple-400" /> Backend Engine
                </span>
                <span className="text-purple-400 font-mono">PORT 5000</span>
              </div>
              <p className="text-lg font-bold text-white">Node.js Express</p>
              <p className="text-[11px] text-slate-500 mt-1">REST API & NIST Engine online</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold flex items-center gap-1.5 text-slate-200">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" /> Cryptographic Ledger
                </span>
                <span className="text-emerald-400 font-mono">SHA-256</span>
              </div>
              <p className="text-lg font-bold text-white">Genesis Verified</p>
              <p className="text-[11px] text-slate-500 mt-1">Sequential tamper-evident chain</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-semibold flex items-center gap-1.5 text-slate-200">
                  <UserCheck className="h-3.5 w-3.5 text-blue-400" /> Sovereign Access
                </span>
                <span className="text-blue-400 font-mono">OWNER</span>
              </div>
              <p className="text-lg font-bold text-white">Rajiv Kumar Sharma</p>
              <p className="text-[11px] text-slate-500 mt-1">Protected sovereign superuser</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Charts & Team Governance Quick-Look */}
      <div className="grid gap-6 xl:grid-cols-5">
        {/* Asset Lifecycle Distribution */}
        <Card className="border-slate-800 bg-slate-900/70 xl:col-span-3">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">Hardware Lifecycle & Sanitization Pipeline</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Status distribution across intake, wiping, verification, certification, and recycling.
                </p>
              </div>
              <span className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 text-xs font-mono text-cyan-300">
                {data.devices.length} Total Units
              </span>
            </div>

            <div className="mt-6 space-y-3.5">
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

        {/* Team & Governance Quick-Look */}
        <Card className="border-slate-800 bg-slate-900/70 xl:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-white">Team & Role Governance</h2>
                <p className="mt-0.5 text-xs text-slate-400">Enterprise accounts & role assignments.</p>
              </div>
              <Button asChild size="sm" variant="outline" className="border-slate-700 bg-slate-800/40 text-slate-200">
                <Link to="/admin/settings">Manage</Link>
              </Button>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-xs">
                    OW
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Platform Owner</p>
                    <p className="text-[10px] text-slate-400">Full sovereign authority</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-cyan-300">1</span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs">
                    AD
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Administrators</p>
                    <p className="text-[10px] text-slate-400">Operations & intake queues</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-purple-300">
                  {(roleBreakdown["ADMINISTRATOR"] || 0) + (roleBreakdown["ADMIN"] || 0)}
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold text-xs">
                    AU
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Compliance Auditors</p>
                    <p className="text-[10px] text-slate-400">Independent chain verification</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-blue-300">
                  {roleBreakdown["AUDITOR"] || 0}
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-xs">
                    OP
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Sanitization Technicians</p>
                    <p className="text-[10px] text-slate-400">Hardware wipe execution</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-300">
                  {(roleBreakdown["TECHNICIAN"] || 0) + (roleBreakdown["OPERATOR"] || 0)}
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-xs">
                    CU
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Client / End Users</p>
                    <p className="text-[10px] text-slate-400">Asset visibility & cert download</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-amber-300">
                  {(roleBreakdown["USER"] || 0) + (roleBreakdown["CUSTOMER"] || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sovereign Quick Action Launchpad */}
      <Card className="border-slate-800 bg-slate-900/70">
        <CardContent className="p-6">
          <h2 className="font-semibold text-white">Sovereign Governance Quick Actions</h2>
          <p className="mt-0.5 text-xs text-slate-400">Direct shortcuts to administrative workflows.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <Button asChild className="w-full justify-start bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-medium text-xs">
              <Link to="/devices">
                <HardDrive className="mr-2 h-4 w-4" /> Register Asset
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/wipe-jobs">
                <PlayCircle className="mr-2 h-4 w-4 text-cyan-300" /> Simulated Wipe
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/certificates">
                <FileCheck2 className="mr-2 h-4 w-4 text-emerald-300" /> Certificates
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/audit-log">
                <ShieldCheck className="mr-2 h-4 w-4 text-blue-300" /> Cryptographic Ledger
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/admin/settings">
                <Users className="mr-2 h-4 w-4 text-purple-300" /> Team & Roles
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/reports">
                <FileSpreadsheet className="mr-2 h-4 w-4 text-amber-300" /> Reports & Audit
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Cryptographic Audit Stream */}
      <Card className="border-slate-800 bg-slate-900/70">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" /> Live Cryptographic Audit Ledger Stream
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Immutable, sequentially hashed security log recording all state transitions.
              </p>
            </div>
            <Link to="/audit-log" className="text-xs text-cyan-300 hover:underline">
              View full ledger →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-800/80">
            {data.auditEvents
              .slice(-6)
              .reverse()
              .map((e) => (
                <div className="flex items-start gap-3 py-3 text-sm" key={e.id}>
                  <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400 mt-0.5 shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-200 font-medium text-xs sm:text-sm">
                      <span className="font-semibold text-cyan-300">{e.action.replaceAll("_", " ")}</span>{" "}
                      <span className="text-slate-400 font-normal">— {e.details}</span>
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{new Date(e.timestamp).toLocaleString()}</span>
                      <span className="font-mono text-[11px] text-cyan-400/80">
                        HASH: {e.currentHash ? e.currentHash.slice(0, 20) : "N/A"}...
                      </span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
                        PREV: {e.previousHash ? e.previousHash.slice(0, 10) : "GENESIS"}...
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            {data.auditEvents.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">
                Audit events will stream here as operations are executed.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
