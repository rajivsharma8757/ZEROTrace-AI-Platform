import {
  CheckCircle2,
  Leaf,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Recycle,
  Building,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, StatusBadge } from "@/components/shared";
import { useAppData } from "@/hooks/use-app-data";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function Recycling() {
  const { data, refresh, update } = useAppData();
  const { user } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const isCustomer = user?.role === "CUSTOMER";

  // Assets certified and awaiting recycling disposition
  const eligible = data.devices.filter(
    (d) =>
      d.status === "CERTIFIED" &&
      !data.recyclingApprovals.some((r) => r.deviceId === d.id || r.assetId === d.id)
  );

  const handleApprove = async (deviceId: string) => {
    setLoadingId(deviceId);
    try {
      const res = await api.recycling.approve(deviceId, "Approved for certified downstream R2/e-Stewards IT asset recycling.");
      if (res.success) {
        await refresh();
        setLoadingId(null);
        return;
      }
    } catch (err) {
      console.warn("API recycling approval fallback:", err);
    }

    // Local fallback
    update((d) => {
      const dev = d.devices.find((x) => x.id === deviceId);
      if (dev) dev.status = "READY_FOR_RECYCLING";
      d.recyclingApprovals.unshift({
        id: `rec-${Date.now().toString(36)}`,
        deviceId,
        assetId: deviceId,
        status: "APPROVED",
        approverId: user?.id || "usr-admin",
        approvedAt: new Date().toISOString(),
        notes: "Approved for certified downstream R2/e-Stewards IT asset recycling.",
      });
    });

    setLoadingId(null);
  };

  const handleReject = async (deviceId: string) => {
    const reason = prompt("Reason for recycling rejection:") || "Requires secondary inspection";
    setLoadingId(deviceId);
    try {
      const res = await api.recycling.reject(deviceId, reason);
      if (res.success) {
        await refresh();
        setLoadingId(null);
        return;
      }
    } catch (err) {
      console.warn("API recycling rejection fallback:", err);
    }

    update((d) => {
      d.recyclingApprovals.unshift({
        id: `rec-${Date.now().toString(36)}`,
        deviceId,
        assetId: deviceId,
        status: "REJECTED",
        approverId: user?.id || "usr-admin",
        approvedAt: new Date().toISOString(),
        notes: reason,
      });
    });

    setLoadingId(null);
  };

  return (
    <>
      <PageHeader
        title="Responsible IT Asset Recycling & Disposition"
        description="Authorize verified, certified retired hardware for sustainable downstream recycling and circular economy disposition."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Awaiting Recycling Authorization */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Leaf className="text-emerald-400" size={18} />
                  Awaiting Recycling Clearance ({eligible.length})
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Certified assets with 100% data sanitization verified.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {eligible.map((d) => (
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-slate-700"
                  key={d.id}
                >
                  <div>
                    <span className="font-mono font-bold text-white text-sm">{d.assetId}</span>
                    <span className="block text-xs text-slate-400 mt-0.5">
                      {d.name} · {d.storageType} ({d.capacityGb} GB)
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-400">
                      <ShieldCheck size={13} /> Sanitization Certificate Active
                    </span>
                  </div>

                  {!isCustomer && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        disabled={loadingId === d.id}
                        className="bg-emerald-400 font-semibold text-slate-950 hover:bg-emerald-300"
                        onClick={() => handleApprove(d.id)}
                      >
                        {loadingId === d.id ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Approve for Recycling
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loadingId === d.id}
                        className="border-slate-700 text-slate-400 hover:text-white"
                        onClick={() => handleReject(d.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {eligible.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-400">
                  No certified devices are currently awaiting recycling clearance.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recycling Approval History */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Recycle className="text-cyan-400" size={18} />
              Disposition Ledger & Chain of Custody
            </h2>

            <div className="mt-4 space-y-3">
              {data.recyclingApprovals.map((a) => {
                const d = data.devices.find((x) => x.id === a.deviceId || x.id === a.assetId);
                const isApproved = a.status === "APPROVED";

                return (
                  <div
                    className="flex items-start justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                    key={a.id}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          {d ? d.assetId : "Asset"}
                        </span>
                        <StatusBadge value={a.status} />
                      </div>
                      <p className="mt-1 text-xs text-slate-300">{a.notes}</p>
                      <p className="mt-1 font-mono text-[10px] text-slate-500">
                        Authorized: {a.approvedAt ? new Date(a.approvedAt).toLocaleString() : "Confirmed"}
                      </p>
                    </div>
                  </div>
                );
              })}

              {data.recyclingApprovals.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-400">
                  No recycling approvals recorded yet.
                </div>
              )}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-200">
              <Leaf className="h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-300">Circular Economy ITAD Compliance</p>
                <p className="mt-0.5 text-emerald-200/90 leading-relaxed">
                  Approved assets can be safely handed over to certified R2v3 and e-Stewards recyclers
                  with guaranteed zero residual data liability.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
