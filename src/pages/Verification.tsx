import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Search,
  Check,
  FileCheck2,
  Loader2,
  AlertOctagon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, StatusBadge } from "@/components/shared";
import { useAppData } from "@/hooks/use-app-data";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function Verification() {
  const { data, refresh, update } = useAppData();
  const { user } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const isCustomer = user?.role === "CUSTOMER";
  const visible = isCustomer
    ? data.verifications.filter((v) => {
        const d = data.devices.find((x) => x.id === v.deviceId || x.id === v.assetId);
        return d?.ownerId === user?.id;
      })
    : data.verifications;

  const handleDecision = async (verId: string, pass: boolean) => {
    setLoadingId(verId);
    const decision = pass ? "PASSED" : "FAILED";
    const notes = pass
      ? "Simulated evidence review passed: 32 sampled storage sectors confirmed zero-entropy pattern."
      : "Simulated evidence review failed: validation exception recorded during sampled read.";

    try {
      const res = await api.verification.submitDecision(verId, { decision, notes });
      if (res.success) {
        await refresh();
        setLoadingId(null);
        return;
      }
    } catch (err) {
      console.warn("API verification decision fallback:", err);
    }

    // Local fallback
    update((d) => {
      const v = d.verifications.find((x) => x.id === verId);
      if (!v) return;
      const device = d.devices.find((x) => x.id === v.deviceId || x.id === v.assetId);
      v.result = pass ? "PASS" : "FAIL";
      v.verifiedAt = new Date().toISOString();
      v.verifierId = user?.id || "usr-operator";
      v.evidence = notes;
      if (device) {
        device.status = pass ? "VERIFIED" : "FAILED";
      }
    });

    setLoadingId(null);
  };

  return (
    <>
      <PageHeader
        title="Sanitization Verification & Evidence Review"
        description="Independently validate data erasure proofs, sampled read audits, and cryptographic zero-entropy confirmations before certifying."
      />

      <div className="space-y-4">
        {visible.map((v) => {
          const d = data.devices.find((x) => x.id === v.deviceId || x.id === v.assetId);
          const isPending = v.result === "PENDING" || v.status === "PENDING";
          const isPass = v.result === "PASS" || v.status === "PASSED";
          const isFail = v.result === "FAIL" || v.status === "FAILED";

          return (
            <Card className="border-slate-800 bg-slate-900/60 shadow-sm" key={v.id}>
              <CardContent className="p-6">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-slate-800 p-2 text-cyan-400">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">
                          {d ? d.assetId : "Unknown Asset"} · {d ? d.name : "Device"}
                        </h2>
                        <span className="text-xs text-slate-400">
                          Storage: {d ? `${d.storageType} (${d.capacityGb} GB)` : "N/A"}
                        </span>
                      </div>
                      <StatusBadge value={isPass ? "VERIFIED" : isFail ? "FAILED" : "PENDING"} />
                    </div>

                    <dl className="mt-5 grid gap-4 text-xs sm:grid-cols-3 border-t border-slate-800/80 pt-4">
                      <div>
                        <dt className="text-slate-500 font-medium">Verification Protocol</dt>
                        <dd className="text-slate-200 mt-1 font-semibold">{v.method}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500 font-medium">Review Timestamp</dt>
                        <dd className="text-slate-200 mt-1 font-mono">
                          {v.verifiedAt ? new Date(v.verifiedAt).toLocaleString() : "Awaiting Inspector Review"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500 font-medium">Inspector / Verifier ID</dt>
                        <dd className="text-slate-200 mt-1 font-mono">{v.verifierId || "Pending Assignment"}</dd>
                      </div>

                      <div className="sm:col-span-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                        <dt className="text-slate-500 font-medium">Cryptographic Evidence & Sampled Proof</dt>
                        <dd className="text-slate-300 mt-1 font-mono text-[11px] leading-relaxed">
                          {v.evidence}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Decision Controls */}
                  {isPending && !isCustomer && (
                    <div className="flex shrink-0 items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        disabled={loadingId === v.id}
                        className="bg-emerald-400 font-semibold text-slate-950 hover:bg-emerald-300"
                        onClick={() => handleDecision(v.id, true)}
                      >
                        {loadingId === v.id ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Pass Verification
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loadingId === v.id}
                        className="border-rose-400/40 text-rose-300 hover:bg-rose-950/40 hover:text-white"
                        onClick={() => handleDecision(v.id, false)}
                      >
                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                        Reject / Fail
                      </Button>
                    </div>
                  )}

                  {isPass && (
                    <div className="flex shrink-0 flex-col items-end gap-2 pt-1">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 text-xs font-medium text-emerald-400">
                        <Check size={14} /> Audit Approved
                      </span>
                      <Button asChild size="sm" variant="outline" className="border-slate-700 bg-slate-800 text-xs">
                        <Link to="/certificates">
                          <FileCheck2 className="mr-1 h-3.5 w-3.5 text-cyan-300" /> Issue Certificate →
                        </Link>
                      </Button>
                    </div>
                  )}

                  {isFail && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-950/40 border border-rose-800/60 px-2.5 py-1 text-xs font-medium text-rose-400">
                        <AlertOctagon size={14} /> Verification Failed
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {visible.length === 0 && (
          <Card className="border-slate-800 bg-slate-900/60">
            <CardContent className="py-16 text-center text-sm text-slate-400">
              No completed wipe jobs are currently awaiting verification.
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
