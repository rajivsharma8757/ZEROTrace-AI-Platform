import {
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Download,
  ExternalLink,
  QrCode,
  Lock,
  Loader2,
  Building,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function PublicVerify() {
  const { certificateId } = useParams();
  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPublicCert() {
      if (!certificateId) return;
      try {
        setLoading(true);
        const res = await api.certificates.publicVerify(certificateId);
        if (res.success && res.certificate) {
          setCertData(res.certificate);
        } else {
          setError(res.message || "Certificate record not found in registry.");
        }
      } catch (err: any) {
        setError("Unable to retrieve certificate verification data.");
      } finally {
        setLoading(false);
      }
    }
    loadPublicCert();
  }, [certificateId]);

  const isValid = certData?.status === "VALID";

  return (
    <main className="min-h-screen bg-[#06101e] text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      <div className="mx-auto w-full max-w-2xl pt-6">
        {/* Header Branding */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-400 text-slate-950">
              <ShieldCheck size={20} />
            </span>
            ZEROTrace <span className="text-cyan-300">AI</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-950/40 px-3 py-1 text-xs font-mono text-cyan-300">
            <Lock size={12} /> Public Verification Gateway
          </div>
        </div>

        {/* Verification Card */}
        <Card className="border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur">
          <CardContent className="p-6 sm:p-10">
            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-400" />
                <p className="mt-4 text-sm text-slate-400">Verifying cryptographic hash in registry...</p>
              </div>
            ) : certData ? (
              <>
                <div className="flex items-start justify-between border-b border-slate-800 pb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`grid h-14 w-14 place-items-center rounded-2xl ${
                        isValid ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {isValid ? <CheckCircle2 size={32} /> : <ShieldAlert size={32} />}
                    </div>
                    <div>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isValid ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isValid ? "AUTHENTIC CERTIFICATE · NIST COMPLIANT" : "REVOKED CERTIFICATE"}
                      </span>
                      <h1 className="mt-1 text-2xl font-mono font-bold text-white">
                        {certData.certificateNumber}
                      </h1>
                    </div>
                  </div>
                  {certData.qrCodeUrl && (
                    <img
                      src={certData.qrCodeUrl}
                      alt="Verification QR"
                      className="hidden sm:block h-16 w-16 rounded bg-white p-1"
                    />
                  )}
                </div>

                <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-slate-500">Asset Tag / Identifier</dt>
                    <dd className="font-semibold text-white mt-0.5">{certData.asset?.assetTag || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Hardware Model & Serial</dt>
                    <dd className="font-semibold text-white mt-0.5">
                      {certData.asset?.make} {certData.asset?.model} (S/N: {certData.asset?.serialNumber})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Sanitization Standard</dt>
                    <dd className="text-cyan-300 font-semibold mt-0.5">
                      {certData.sanitizationMethod || "NIST SP 800-88 Rev. 2 Purge"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Storage Specification</dt>
                    <dd className="text-slate-300 mt-0.5">
                      {certData.asset?.storageType} ({certData.asset?.storageCapacityGb} GB)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Issue Timestamp</dt>
                    <dd className="font-mono text-slate-300 mt-0.5">
                      {new Date(certData.issuedAt).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Issuing Authority</dt>
                    <dd className="text-slate-300 mt-0.5">
                      {certData.issuedByUser?.fullName || "ZEROTrace AI Certified Officer"}
                    </dd>
                  </div>

                  <div className="sm:col-span-2 rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <dt className="text-xs text-slate-500">Cryptographic Certificate SHA-256 Hash</dt>
                    <dd className="mt-1 font-mono text-xs text-cyan-300 break-all">
                      {certData.certificateHash}
                    </dd>
                  </div>
                </dl>

                <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    className="w-full sm:w-auto bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300"
                    onClick={() => {
                      window.open(api.certificates.getPdfDownloadUrl(certData.id), "_blank");
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download Official Signed PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-slate-700 bg-slate-800/60 text-slate-200"
                    asChild
                  >
                    <Link to="/login">Sign in to ZEROTrace Platform →</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-16 text-center">
                <ShieldAlert className="mx-auto text-rose-400" size={54} />
                <h1 className="mt-4 text-2xl font-bold text-white">INVALID OR UNKNOWN CERTIFICATE</h1>
                <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
                  {error || "No verified data sanitization certificate matches the provided identifier."}
                </p>
                <Button asChild className="mt-6 bg-slate-800 text-slate-200 hover:bg-slate-700">
                  <Link to="/login">Back to Gateway</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <footer className="mt-12 text-center text-xs text-slate-500 pb-4">
        ZEROTrace AI · Smart India Hackathon 2026 · Secure IT Asset Recycling Architecture
      </footer>
    </main>
  );
}
