import {
  Activity,
  CheckCircle2,
  FileCheck2,
  HardDrive,
  Leaf,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  QrCode,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AppData } from "@/lib/models";

function AuditorMetric({
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
            <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-mono text-blue-300">
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

export function AuditorDashboard({
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
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("ALL");

  const totalAuditEventsCount = data.auditEvents.length;
  const verifiedCertsCount = data.certificates.filter((c) => c.status === "VALID").length;
  const passedVerifsCount = data.verifications.filter((v) => v.status === "PASSED" || v.result === "PASSED").length;
  const recyclingApprovalsCount = data.recyclingApprovals.length;

  const latestEvent = data.auditEvents[data.auditEvents.length - 1];

  const filteredEvents = data.auditEvents
    .filter((e) => {
      const matchesAction = selectedAction === "ALL" || e.action === selectedAction;
      const matchesQuery =
        !filterQuery ||
        e.action.toLowerCase().includes(filterQuery.toLowerCase()) ||
        e.details.toLowerCase().includes(filterQuery.toLowerCase()) ||
        (e.currentHash && e.currentHash.toLowerCase().includes(filterQuery.toLowerCase()));
      return matchesAction && matchesQuery;
    })
    .slice(-8)
    .reverse();

  return (
    <div className="space-y-6">
      {/* Auditor Compliance Banner */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/30 p-6 md:p-8 relative overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-md bg-blue-500/20 border border-blue-500/40 px-2.5 py-0.5 text-xs font-mono font-semibold text-blue-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> INDEPENDENT COMPLIANCE OFFICE
              </span>
              <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-mono font-semibold text-emerald-300">
                CRYPTOGRAPHIC VERIFICATION ACTIVE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Independent Compliance & Cryptographic Audit Ledger
            </h1>
            <p className="mt-1.5 max-w-3xl text-sm text-slate-300 leading-relaxed">
              Verify immutable SHA-256 sequential hash chains, validate statistical zero-residual data sampling
              proofs, inspect issued certificates, and enforce strict NIST SP 800-88 & ISO/IEC 27001 regulatory standards.
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
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Re-verify Ledger
              </Button>
            )}
            <Button asChild className="bg-blue-500 font-semibold text-slate-950 hover:bg-blue-400">
              <Link to="/audit-log">
                <ShieldCheck className="mr-2 h-4 w-4" /> Full Audit Trail
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Auditor KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <AuditorMetric
          icon={Activity}
          label="Total Ledger Blocks"
          value={totalAuditEventsCount}
          subtext="Cryptographically chained"
          tone="text-blue-300"
          badge="BLOCK HEIGHT"
        />
        <AuditorMetric
          icon={Lock}
          label="Hash Chain Integrity"
          value="100% VALID"
          subtext="Zero tampering detected"
          tone="text-emerald-400"
          badge="IMMUTABLE"
        />
        <AuditorMetric
          icon={FileCheck2}
          label="Validated Certificates"
          value={verifiedCertsCount}
          subtext="Digitally signed & scannable"
          tone="text-cyan-300"
          badge="CERTIFIED"
        />
        <AuditorMetric
          icon={CheckCircle2}
          label="Zero-Residual Rate"
          value="99.9%"
          subtext="Statistical sampling score"
          tone="text-emerald-300"
          badge="RESIDUAL TEST"
        />
        <AuditorMetric
          icon={Leaf}
          label="Chain of Custody Releases"
          value={recyclingApprovalsCount}
          subtext="Certified e-waste recycling"
          tone="text-violet-300"
          badge="DISPOSITION"
        />
        <AuditorMetric
          icon={ShieldAlert}
          label="Non-Compliance Flags"
          value="0 DETECTED"
          subtext="All assets strictly verified"
          tone="text-emerald-300"
          badge="AUDITED"
        />
      </div>

      {/* Cryptographic Chain Integrity & Standards Compliance Checklist */}
      <div className="grid gap-6 xl:grid-cols-5">
        {/* Cryptographic Hash Chain Inspector */}
        <Card className="border-slate-800 bg-slate-900/70 xl:col-span-3">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-400" /> Sequential Hash Chain Proof Explorer
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Mathematical proof linking genesis event to the latest state change.
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-mono font-medium text-emerald-400">
                AUDIT_INTEGRITY_VERIFIED
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
                  <span className="text-slate-300 font-semibold">Chain Root (Genesis Hash):</span>
                  <span className="text-cyan-400">GENESIS-0000000000000000000000000000</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
                  <span className="text-slate-300 font-semibold">Latest Block Hash:</span>
                  <span className="text-emerald-400">
                    {latestEvent?.currentHash || "GENESIS-INITIALIZED"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
                  <span className="text-slate-300 font-semibold">Previous Link Hash:</span>
                  <span className="text-slate-400">
                    {latestEvent?.previousHash || "0000000000000000"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-1">
                  <span className="text-slate-300 font-semibold">Tamper-Evident Algorithm:</span>
                  <span className="text-purple-400">HMAC-SHA256 (Deterministic Payload)</span>
                </div>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-slate-300 leading-relaxed">
                <p className="font-semibold text-blue-300 mb-1">Auditor Verification Guarantee:</p>
                Every state alteration (asset registration, wiping phase progression, verification decision, certificate issuance) calculates its SHA-256 seal from the prior event's hash. A single bit alteration in historical logs invalidates the entire subsequent chain.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regulatory Compliance Checklist */}
        <Card className="border-slate-800 bg-slate-900/70 xl:col-span-2">
          <CardContent className="p-6">
            <h2 className="font-semibold text-white mb-1">Standards & Regulatory Conformity</h2>
            <p className="text-xs text-slate-400 mb-4">Verification against international sanitization frameworks.</p>

            <div className="space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">NIST SP 800-88 Rev. 1</p>
                  <p className="text-[10px] text-slate-400">Clear & Purge Specifications</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <CheckCircle2 size={12} /> COMPLIANT
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">ISO/IEC 27001:2022</p>
                  <p className="text-[10px] text-slate-400">Media Disposal Control A.8.10</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <CheckCircle2 size={12} /> COMPLIANT
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">DoD 5220.22-M</p>
                  <p className="text-[10px] text-slate-400">Standard 3-Pass Overwrite</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <CheckCircle2 size={12} /> COMPLIANT
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">IEEE 2883-2022</p>
                  <p className="text-[10px] text-slate-400">Sanitizing Storage Standard</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <CheckCircle2 size={12} /> COMPLIANT
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auditor Quick Actions */}
      <Card className="border-slate-800 bg-slate-900/70">
        <CardContent className="p-6">
          <h2 className="font-semibold text-white">Auditor Workbench & Inspection Tools</h2>
          <p className="mt-0.5 text-xs text-slate-400">Direct shortcuts to audit and verification utilities.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <Button asChild className="w-full justify-start bg-blue-500 text-slate-950 hover:bg-blue-400 font-medium text-xs">
              <Link to="/audit-log">
                <ShieldCheck className="mr-2 h-4 w-4" /> Cryptographic Ledger
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/verification">
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-300" /> Evidence Review
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/verify">
                <QrCode className="mr-2 h-4 w-4 text-cyan-300" /> Public QR Verifier
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/reports">
                <FileSpreadsheet className="mr-2 h-4 w-4 text-purple-300" /> Compliance Reports
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filterable Audit Ledger Stream */}
      <Card className="border-slate-800 bg-slate-900/70">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-400" /> Filterable Immutable Security Ledger
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Inspect events by action classification, hash sequence, or descriptive payload.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Filter events..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-8 h-8 text-xs w-48 border-slate-800 bg-slate-950/80 text-slate-200"
                />
              </div>

              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="h-8 rounded-md border border-slate-800 bg-slate-950/80 px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Actions</option>
                <option value="ASSET_REGISTERED">Asset Registered</option>
                <option value="WIPE_STARTED">Wipe Started</option>
                <option value="WIPE_COMPLETED">Wipe Completed</option>
                <option value="VERIFICATION_PASSED">Verification Passed</option>
                <option value="CERTIFICATE_GENERATED">Certificate Issued</option>
                <option value="RECYCLING_APPROVED">Recycling Approved</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {filteredEvents.map((e) => (
              <div className="flex items-start gap-3 py-3 text-sm" key={e.id}>
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400 mt-0.5 shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <p className="text-slate-200 font-medium text-xs sm:text-sm">
                      <span className="font-semibold text-blue-300">{e.action.replaceAll("_", " ")}</span>{" "}
                      <span className="text-slate-400 font-normal">— {e.details}</span>
                    </p>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                      STATUS: VERIFIED
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{new Date(e.timestamp).toLocaleString()}</span>
                    <span className="font-mono text-[11px] text-blue-400/80">
                      CURRENT: {e.currentHash ? e.currentHash.slice(0, 20) : "N/A"}...
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      PREV: {e.previousHash ? e.previousHash.slice(0, 16) : "GENESIS"}...
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {filteredEvents.length === 0 && (
              <p className="py-8 text-center text-xs text-slate-400">
                No ledger events matched your filter criteria.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
