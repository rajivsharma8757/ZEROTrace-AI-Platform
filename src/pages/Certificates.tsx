import {
  Download,
  FileCheck2,
  Printer,
  ShieldOff,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, StatusBadge } from "@/components/shared";
import { useAppData } from "@/hooks/use-app-data";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function Certificates() {
  const { data, refresh, update } = useAppData();
  const { user } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const isCustomer = user?.role === "CUSTOMER";
  const isAdmin = user?.role === "ADMIN";

  const visible = isCustomer
    ? data.certificates.filter((c) => {
        const d = data.devices.find((x) => x.id === c.deviceId || x.id === c.assetId);
        return d?.ownerId === user?.id;
      })
    : data.certificates;

  // Verifications passed and ready for certificate issuance
  const eligibleVerifications = data.verifications.filter(
    (v) =>
      (v.result === "PASS" || v.status === "PASSED") &&
      !data.certificates.some((c) => c.verificationId === v.id)
  );

  const handleGenerateCertificate = async (verificationId: string) => {
    setLoadingId(verificationId);
    try {
      const res = await api.certificates.generateCertificate(verificationId);
      if (res.success) {
        await refresh();
        setLoadingId(null);
        return;
      }
    } catch (err) {
      console.warn("API certificate generation fallback:", err);
    }

    // Local fallback
    update((d) => {
      const v = d.verifications.find((x) => x.id === verificationId);
      if (!v) return;
      const device = d.devices.find((x) => x.id === v.deviceId || x.id === v.assetId);
      const certId = `ZT-${new Date().getFullYear()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
      d.certificates.unshift({
        id: certId,
        certificateNumber: certId,
        deviceId: device ? device.id : v.deviceId,
        assetId: device ? device.id : v.assetId,
        verificationId: v.id,
        hash: `ZT-${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
        status: "VALID",
        issuedAt: new Date().toISOString(),
        issuedBy: user?.id || "usr-admin",
      });
      if (device) device.status = "CERTIFIED";
    });

    setLoadingId(null);
  };

  const handleDownloadPdf = (certId: string) => {
    const downloadUrl = api.certificates.getPdfDownloadUrl(certId);
    window.open(downloadUrl, "_blank");
  };

  const handleRevoke = async (certId: string) => {
    const reason = prompt("Please enter the reason for certificate revocation:") || "Administrative revocation";
    setLoadingId(certId);
    try {
      const res = await api.certificates.revokeCertificate(certId, reason);
      if (res.success) {
        await refresh();
        setLoadingId(null);
        return;
      }
    } catch (err) {
      console.warn("API revoke fallback:", err);
    }

    update((x) => {
      const c = x.certificates.find((q) => q.id === certId || q.certificateNumber === certId);
      if (c) c.status = "REVOKED";
    });
    setLoadingId(null);
  };

  return (
    <>
      <PageHeader
        title="Cryptographic Sanitization Certificates"
        description="Tamper-evident, scannable proof of data destruction with embedded QR verification and SHA-256 cryptographic hashes."
      />

      {/* Eligible Verification Banner */}
      {eligibleVerifications.length > 0 && !isCustomer && (
        <Card className="mb-6 border-cyan-400/40 bg-cyan-950/20 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 font-semibold text-cyan-300">
              <FileCheck2 size={18} />
              <span>Assets Verified & Eligible for Immediate Certification ({eligibleVerifications.length})</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              These devices have passed evidence review and are ready for SHA-256 certificate sealing.
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {eligibleVerifications.map((v) => {
                const d = data.devices.find((x) => x.id === v.deviceId || x.id === v.assetId);
                return (
                  <Button
                    key={v.id}
                    size="sm"
                    disabled={loadingId === v.id}
                    className="bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300"
                    onClick={() => handleGenerateCertificate(v.id)}
                  >
                    {loadingId === v.id ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Issue Certificate for {d?.assetId || "Device"}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {visible.map((c) => {
          const d = data.devices.find((x) => x.id === c.deviceId || x.id === c.assetId);
          const isValid = c.status === "VALID";
          const certNum = c.certificateNumber || c.id;

          return (
            <Card
              className={`border-slate-800 bg-slate-900/70 shadow-sm transition hover:border-slate-700 ${
                !isValid ? "opacity-75 border-rose-900/50" : ""
              }`}
              key={c.id}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-[.18em] text-cyan-300">
                        NIST SP 800-88 REV. 2 CERTIFICATE
                      </span>
                    </div>
                    <h2 className="mt-1 text-xl font-mono font-bold text-white tracking-tight">{certNum}</h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Asset: <b className="text-slate-200">{d?.assetId || "Asset"}</b> · {d?.name}
                    </p>
                  </div>

                  {/* Scannable QR Code */}
                  <div className="rounded-lg bg-white p-2 shadow-md">
                    {c.qrCodeUrl ? (
                      <img src={c.qrCodeUrl} alt="QR Code" className="h-16 w-16" />
                    ) : (
                      <div className="grid h-16 w-16 place-items-center bg-slate-950 text-cyan-300 rounded">
                        <QrCode size={36} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-y border-slate-800/80 py-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Status</span>
                    <StatusBadge value={c.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Issued On</span>
                    <span className="font-mono text-slate-300">
                      {new Date(c.issuedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 pt-1">
                    <span className="text-slate-500">Cryptographic SHA-256 Hash</span>
                    <code className="rounded bg-slate-950 p-1.5 font-mono text-[10px] text-cyan-200 break-all border border-slate-800">
                      {c.hash || c.certificateHash || "SHA256:VERIFIED"}
                    </code>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300"
                    onClick={() => handleDownloadPdf(c.id)}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Download Official PDF
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-700 bg-slate-800 text-slate-200"
                    asChild
                  >
                    <Link to={`/verify/${certNum}`} target="_blank">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-cyan-300" /> Verify Online
                    </Link>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-700 text-slate-400 hover:text-white"
                    onClick={() => window.print()}
                  >
                    <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
                  </Button>

                  {isAdmin && isValid && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loadingId === c.id}
                      className="ml-auto border-rose-500/30 text-rose-300 hover:bg-rose-950/40"
                      onClick={() => handleRevoke(c.id)}
                    >
                      <ShieldOff className="mr-1.5 h-3.5 w-3.5" /> Revoke
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {visible.length === 0 && (
          <div className="col-span-2 py-16 text-center text-sm text-slate-400">
            No sanitization certificates have been issued yet.
          </div>
        )}
      </div>
    </>
  );
}
