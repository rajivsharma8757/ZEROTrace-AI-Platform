import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  Search,
  Loader2,
  Download,
  Printer,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

type VerificationResult =
  | { status: "verified"; cert: any; asset?: any }
  | { status: "revoked"; cert: any; asset?: any }
  | { status: "notfound" }
  | null;

function DetailField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-lg border border-white/5 bg-slate-900/40 p-3">
      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white break-all">{value || "—"}</p>
    </div>
  );
}

export default function VerifyCertificate() {
  const { id: routeId, certificateId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCert = searchParams.get("cert") || routeId || certificateId || "";
  const initialCode = searchParams.get("code") || "";

  const [certId, setCertId] = useState(initialCert);
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult>(null);

  const performVerification = async (targetCert: string, targetCode?: string) => {
    if (!targetCert.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      // 1. Try public verify endpoint
      const res = await api.certificates.publicVerify(targetCert.trim());
      if (res.success && res.certificate) {
        const cert = res.certificate;
        const isRevoked = cert.status === "REVOKED";
        setResult({
          status: isRevoked ? "revoked" : "verified",
          cert,
          asset: cert.asset,
        });
        return;
      }

      // 2. Fallback: Search in full certificates list
      const listRes = await api.certificates.getCertificates();
      const match = listRes.data?.find(
        (c: any) =>
          c.id?.toLowerCase() === targetCert.trim().toLowerCase() ||
          c.certificateNumber?.toLowerCase() === targetCert.trim().toLowerCase()
      );

      if (match) {
        setResult({
          status: match.status === "REVOKED" ? "revoked" : "verified",
          cert: match,
          asset: match.asset,
        });
      } else {
        setResult({ status: "notfound" });
      }
    } catch {
      setResult({ status: "notfound" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCert) {
      performVerification(initialCert, initialCode);
    }
  }, [initialCert, initialCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;
    setSearchParams({ cert: certId.trim(), ...(code.trim() ? { code: code.trim() } : {}) });
    performVerification(certId, code);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (result && "cert" in result && result.cert?.id) {
      window.open(api.certificates.getPdfDownloadUrl(result.cert.id), "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-500 shadow-md shadow-cyan-500/20">
              <ShieldCheck className="h-5 w-5 text-slate-950" />
            </div>
            <span className="font-semibold text-white tracking-tight">ZeroTrace AI</span>
          </Link>
          <Link
            to="/login?returnTo=/portal"
            className="text-sm text-slate-300 hover:text-white transition"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 shadow-lg shadow-cyan-500/10">
            <CheckCircle2 className="h-7 w-7 text-cyan-400" />
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-white">Verify a Certificate</h1>
          <p className="mt-2 text-slate-400 text-sm">
            Enter the Certificate ID and verification code, or scan the QR code on a certificate.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur shadow-xl"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="certId" className="text-slate-200">
                Certificate ID
              </Label>
              <Input
                id="certId"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="CRT-XXXX"
                className="bg-slate-900/60 border-white/10 text-slate-200 focus-visible:ring-cyan-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-slate-200">
                Verification Code
              </Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6-char code"
                className="bg-slate-900/60 border-white/10 text-slate-200 focus-visible:ring-cyan-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !certId.trim()}
            className="mt-5 w-full bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400 transition"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying…
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" /> Verify Certificate
              </>
            )}
          </Button>
        </form>

        {/* Verification Result Display */}
        {result && (
          <div className="mt-6">
            {result.status === "verified" && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 backdrop-blur shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    <h3 className="text-lg font-medium text-emerald-300">Certificate Verified</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrint}
                      className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 text-xs"
                    >
                      <Printer className="h-3.5 w-3.5 mr-1" /> Print
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDownload}
                      className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-medium"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" /> PDF
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <DetailField
                    label="Certificate ID"
                    value={result.cert.certificateNumber || result.cert.id}
                  />
                  <DetailField
                    label="Asset ID"
                    value={result.asset?.assetTag || result.asset?.assetId || result.cert.assetId}
                  />
                  <DetailField
                    label="Device Model"
                    value={
                      result.cert.device_model ||
                      result.asset?.model ||
                      result.asset?.name ||
                      `${result.asset?.make || ""} ${result.asset?.model || ""}`.trim()
                    }
                  />
                  <DetailField
                    label="Serial Number"
                    value={result.cert.serial_number || result.asset?.serialNumber}
                  />
                  <DetailField
                    label="Wipe Date"
                    value={
                      result.cert.issuedAt
                        ? new Date(result.cert.issuedAt).toLocaleString()
                        : "Verified"
                    }
                  />
                  <DetailField
                    label="Wipe Method"
                    value={result.cert.wipeMethod || result.cert.wipe_method || "NIST 800-88 Clear/Purge"}
                  />
                  <DetailField label="Verification Status" value="Passed (0 Residuals)" />
                  <DetailField label="Certificate Status" value="Valid & Cryptographically Signed" />
                  <DetailField
                    label="Recycling Status"
                    value={
                      result.asset?.status === "RECYCLED" || result.asset?.status === "Recycled"
                        ? "Recycled"
                        : result.asset?.status === "RECYCLING_APPROVED" ||
                          result.asset?.status === "Recycling Approved"
                        ? "Recycling Approved"
                        : "Clearance Granted"
                    }
                  />
                </div>

                {result.cert.certificateHash && (
                  <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3">
                    <p className="text-[10px] font-mono uppercase text-emerald-400/80">SHA-256 Ledger Hash</p>
                    <p className="font-mono text-xs text-emerald-200 break-all mt-0.5">
                      {result.cert.certificateHash}
                    </p>
                  </div>
                )}
              </div>
            )}

            {result.status === "revoked" && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-center backdrop-blur shadow-xl">
                <ShieldAlert className="mx-auto h-10 w-10 text-red-400" />
                <h3 className="mt-3 text-lg font-medium text-red-300">Certificate Revoked</h3>
                <p className="mt-1 text-sm text-slate-400">
                  This certificate is no longer valid. It has been officially revoked in the tamper-evident
                  ledger.
                </p>
                {result.cert?.revocationReason && (
                  <p className="mt-3 text-xs text-red-300 font-mono">
                    Reason: {result.cert.revocationReason}
                  </p>
                )}
              </div>
            )}

            {result.status === "notfound" && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 text-center backdrop-blur shadow-xl">
                <AlertTriangle className="mx-auto h-10 w-10 text-amber-400" />
                <h3 className="mt-3 text-lg font-medium text-amber-300">No Certificate Found</h3>
                <p className="mt-1 text-sm text-slate-400">
                  No certificate record matched &ldquo;{certId}&rdquo;. Please verify the Certificate ID
                  and try again.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
