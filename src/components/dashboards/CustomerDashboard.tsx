import {
  Activity,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck2,
  HardDrive,
  Leaf,
  QrCode,
  RefreshCw,
  Shield,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared";
import type { AppData } from "@/lib/models";

function CustomerMetric({
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

export function CustomerDashboard({
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
  // Scoped to customer devices
  const scopedDevices = data.devices.filter(
    (d) => d.ownerId === user.id || !d.ownerId || user.role === "ADMIN" || user.role === "OWNER"
  );
  const scopedCerts = data.certificates.filter((c) =>
    scopedDevices.some((d) => d.id === c.deviceId)
  );

  const activeSanitizing = scopedDevices.filter((d) =>
    ["WIPING", "WIPE_PENDING", "VERIFICATION_PENDING"].includes(d.status)
  ).length;

  const certifiedCount = scopedDevices.filter((d) =>
    ["CERTIFIED", "READY_FOR_RECYCLING", "RECYCLED"].includes(d.status)
  ).length;

  const recycledCount = scopedDevices.filter((d) =>
    ["READY_FOR_RECYCLING", "RECYCLED"].includes(d.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Customer Welcome Banner */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/30 p-6 md:p-8 relative overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-md bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 text-xs font-mono font-semibold text-cyan-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> CLIENT DATA SECURITY PORTAL
              </span>
              <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-mono font-semibold text-emerald-300">
                100% ZERO RESIDUE GUARANTEE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Enterprise IT Asset Sanitization Portal
            </h1>
            <p className="mt-1.5 max-w-3xl text-sm text-slate-300 leading-relaxed">
              Track your organization's retired IT hardware through certified NIST SP 800-88 erasure, download
              cryptographically verifiable Certificates of Destruction, and view environmental recycling records.
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
              <Link to="/certificates">
                <FileCheck2 className="mr-2 h-4 w-4" /> My Certificates
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Customer KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <CustomerMetric
          icon={HardDrive}
          label="Registered Devices"
          value={scopedDevices.length}
          subtext="Under ZEROTrace custody"
          tone="text-slate-200"
          badge="HARDWARE"
        />
        <CustomerMetric
          icon={Activity}
          label="In-Sanitization"
          value={activeSanitizing}
          subtext="Undergoing secure erasure"
          tone="text-cyan-300"
          badge="PROCESSING"
        />
        <CustomerMetric
          icon={CheckCircle2}
          label="Certified Clean"
          value={certifiedCount}
          subtext="Zero residual data verified"
          tone="text-emerald-300"
          badge="CERTIFIED"
        />
        <CustomerMetric
          icon={FileCheck2}
          label="Issued Certificates"
          value={scopedCerts.length}
          subtext="Downloadable PDF proofs"
          tone="text-blue-300"
          badge="SEALED"
        />
        <CustomerMetric
          icon={Leaf}
          label="Recycled Responsibly"
          value={recycledCount}
          subtext="Eco-friendly e-waste diversion"
          tone="text-violet-300"
          badge="CIRCULAR"
        />
        <CustomerMetric
          icon={ShieldCheck}
          label="Security Standard"
          value="NIST PURGE"
          subtext="Government-grade protection"
          tone="text-emerald-400"
          badge="GUARANTEED"
        />
      </div>

      {/* Client's Asset Status Tracker */}
      <Card className="border-slate-800 bg-slate-900/70">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-white flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-cyan-400" /> My Organization's IT Inventory
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Real-time tracking of individual hardware units throughout the sanitization and recycling lifecycle.
              </p>
            </div>
            <Button asChild size="sm" variant="outline" className="border-slate-700 bg-slate-800/40 text-slate-200">
              <Link to="/devices">View All Devices →</Link>
            </Button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {scopedDevices.slice(0, 5).map((d) => {
              const cert = data.certificates.find((c) => c.deviceId === d.id);
              const isCertified = ["CERTIFIED", "READY_FOR_RECYCLING", "RECYCLED"].includes(d.status);

              return (
                <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">
                        {d.make} {d.model}
                      </span>
                      <StatusBadge value={d.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Serial: {d.serialNumber} • Storage: {d.storageType} ({d.capacityGb} GB) • Location: {d.location || "Depository"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isCertified && cert ? (
                      <Button asChild size="sm" className="bg-emerald-500 font-medium text-slate-950 hover:bg-emerald-400 text-xs">
                        <Link to={`/certificates`}>
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Download Certificate
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline" className="border-slate-700 bg-slate-800/40 text-slate-300 text-xs">
                        <Link to="/devices">
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View Details
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {scopedDevices.length === 0 && (
              <p className="py-8 text-center text-xs text-slate-400">
                No IT devices currently registered under your organization.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4 Pillars of ZEROTrace Trust & Assurance */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 space-y-2">
            <div className="rounded-xl bg-cyan-500/10 p-3 w-fit text-cyan-400 mb-3">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-semibold text-white text-sm">1. Zero Residual Data</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every storage sector undergoes automated statistical validation. Zero residual magnetic or flash markers remain.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 space-y-2">
            <div className="rounded-xl bg-emerald-500/10 p-3 w-fit text-emerald-400 mb-3">
              <FileCheck2 size={20} />
            </div>
            <h3 className="font-semibold text-white text-sm">2. Cryptographic Proof</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Erasure certificates are digitally sealed with SHA-256 signatures and recorded to an immutable sequential ledger.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 space-y-2">
            <div className="rounded-xl bg-blue-500/10 p-3 w-fit text-blue-400 mb-3">
              <QrCode size={20} />
            </div>
            <h3 className="font-semibold text-white text-sm">3. Public QR Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anyone with physical possession can scan the tamper-evident QR code to verify certificate authenticity in real-time.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 space-y-2">
            <div className="rounded-xl bg-violet-500/10 p-3 w-fit text-violet-400 mb-3">
              <Leaf size={20} />
            </div>
            <h3 className="font-semibold text-white text-sm">4. Responsible Recycling</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cleared hardware is safely repurposed or transferred to certified circular economy e-waste recyclers.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Quick Actions */}
      <Card className="border-slate-800 bg-slate-900/70">
        <CardContent className="p-6">
          <h2 className="font-semibold text-white">Client Portal Quick Actions</h2>
          <p className="mt-0.5 text-xs text-slate-400">Direct shortcuts to client services.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Button asChild className="w-full justify-start bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-medium text-xs">
              <Link to="/devices">
                <HardDrive className="mr-2 h-4 w-4" /> View My Registered Assets
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/certificates">
                <FileCheck2 className="mr-2 h-4 w-4 text-emerald-300" /> Download Destruction Certificates
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 text-xs">
              <Link to="/verify">
                <QrCode className="mr-2 h-4 w-4 text-blue-300" /> Verify Any Certificate via QR
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
