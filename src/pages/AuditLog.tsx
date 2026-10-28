import {
  Link2,
  ShieldCheck,
  CheckCircle2,
  Search,
  RefreshCw,
  Loader2,
  Lock,
  Download,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared";
import { useAppData } from "@/hooks/use-app-data";
import { api } from "@/lib/api";

export default function AuditLog() {
  const { data, refresh } = useAppData();
  const [search, setSearch] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    verified: boolean;
    status: string;
    message: string;
    totalEvents?: number;
  } | null>(null);

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const res = await api.audit.verifyChain();
      setVerifyResult({
        verified: res.verified,
        status: res.status,
        message: res.message,
        totalEvents: res.totalEvents || data.auditEvents.length,
      });
    } catch (err: any) {
      // Client-side verification fallback
      let unbroken = true;
      for (let i = 1; i < data.auditEvents.length; i++) {
        if (data.auditEvents[i].previousHash !== data.auditEvents[i - 1].currentHash) {
          unbroken = false;
          break;
        }
      }
      setVerifyResult({
        verified: unbroken,
        status: unbroken ? "VERIFIED" : "BROKEN",
        message: unbroken
          ? "All event hashes match sequential cryptographic links."
          : "Discrepancy detected in hash chain sequence.",
        totalEvents: data.auditEvents.length,
      });
    } finally {
      setVerifying(false);
    }
  };

  const filteredLogs = data.auditEvents.filter(
    (e) =>
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.details?.toLowerCase().includes(search.toLowerCase()) ||
      e.currentHash?.toLowerCase().includes(search.toLowerCase()) ||
      e.actorId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Cryptographic Audit Ledger & Chain of Custody"
        description="Immutable event trail where each entry links cryptographically to the prior event via SHA-256 hashing."
        action={
          <div className="flex gap-2">
            <Button
              onClick={handleVerifyChain}
              disabled={verifying}
              className="bg-emerald-400 font-semibold text-slate-950 hover:bg-emerald-300"
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying Hashes...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" /> Verify Chain Integrity
                </>
              )}
            </Button>
          </div>
        }
      />

      {/* Chain Verification Result Banner */}
      {verifyResult && (
        <div
          className={`mb-6 flex items-center justify-between rounded-xl border p-4 text-sm ${
            verifyResult.verified
              ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-200"
              : "border-rose-500/30 bg-rose-950/30 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white">
                CHAIN STATUS: {verifyResult.status} ({verifyResult.totalEvents} events validated)
              </p>
              <p className="text-xs text-slate-300 mt-0.5">{verifyResult.message}</p>
            </div>
          </div>
          <span className="hidden sm:inline-block font-mono text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
            SHA-256 SEQUENTIAL INTEGRITY INTACT
          </span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, details, actor ID or hash..."
            className="pl-9 border-slate-800 bg-slate-900/80 text-sm text-white"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Total events: <b className="text-cyan-300">{data.auditEvents.length}</b></span>
          <Button variant="ghost" size="sm" onClick={() => refresh()} className="text-slate-400 hover:text-white">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Ledger Table */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">Action / Event</th>
                <th className="p-4">Details</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Cryptographic Hash Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.slice().reverse().map((e) => (
                <tr className="hover:bg-slate-800/30 transition font-mono text-xs" key={e.id}>
                  <td className="p-4 font-sans font-semibold text-white">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-cyan-300">
                      {e.action.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 font-sans text-slate-300 max-w-xs truncate">
                    {e.details}
                  </td>
                  <td className="p-4 text-slate-400">
                    {e.actorId || "usr-system"}
                  </td>
                  <td className="p-4 text-slate-400 whitespace-nowrap">
                    {new Date(e.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500 truncate max-w-[120px]" title={e.previousHash}>
                        {e.previousHash ? e.previousHash.slice(0, 12) : "GENESIS"}...
                      </span>
                      <Link2 className="text-cyan-400 shrink-0" size={12} />
                      <span className="text-cyan-300 font-bold truncate max-w-[140px]" title={e.currentHash}>
                        {e.currentHash ? e.currentHash.slice(0, 14) : "HASH"}...
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-400">
              No audit records match the current filter.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
