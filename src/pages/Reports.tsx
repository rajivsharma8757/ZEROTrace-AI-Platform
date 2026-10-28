import {
  FileSpreadsheet,
  Download,
  FileText,
  Filter,
  CheckCircle2,
  HardDrive,
  Activity,
  FileCheck2,
  Leaf,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared";
import { api } from "@/lib/api";

type ReportType = "assets" | "wipes" | "verifications" | "certificates" | "recycling";

const reportCategories: { id: ReportType; label: string; icon: any; description: string }[] = [
  {
    id: "assets",
    label: "Asset Inventory Report",
    icon: HardDrive,
    description: "Complete inventory list, storage media classes, encryption state and lifecycle position.",
  },
  {
    id: "wipes",
    label: "Sanitization Operations",
    icon: Activity,
    description: "Multi-pass wipe logs, NIST SP 800-88 methods, durations, and progress records.",
  },
  {
    id: "verifications",
    label: "Verification & Evidence",
    icon: CheckCircle2,
    description: "Sampled read audit logs, sector checks, pass/fail decisions and inspector IDs.",
  },
  {
    id: "certificates",
    label: "Certificates Registry",
    icon: FileCheck2,
    description: "Official issued certificates, SHA-256 tamper-evident hashes, and validity status.",
  },
  {
    id: "recycling",
    label: "Recycling & Disposition",
    icon: Leaf,
    description: "Authorized e-waste transfer manifests, compliance approvals, and chain of custody.",
  },
];

export default function Reports() {
  const [selectedType, setSelectedType] = useState<ReportType>("assets");
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      try {
        const res = await api.reports.getData(selectedType);
        if (res.success && res.data) {
          setReportData(res.data);
        }
      } catch (err) {
        console.warn("Failed to fetch report from API:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [selectedType]);

  const activeCategory = reportCategories.find((c) => c.id === selectedType)!;

  const handleExportCsv = () => {
    const url = api.reports.getCsvUrl(selectedType);
    window.open(url, "_blank");
  };

  const handleExportPdf = () => {
    const url = api.reports.getPdfUrl(selectedType);
    window.open(url, "_blank");
  };

  return (
    <>
      <PageHeader
        title="Compliance & Audit Reporting Center"
        description="Generate official regulatory manifests, NIST SP 800-88 audit exports, and executive compliance reports."
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportCsv}
              variant="outline"
              className="border-slate-700 bg-slate-900/60 text-slate-200 hover:text-white"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-400" /> Export CSV Data
            </Button>
            <Button
              onClick={handleExportPdf}
              className="bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300"
            >
              <Download className="mr-2 h-4 w-4" /> Download Official PDF Report
            </Button>
          </div>
        }
      />

      {/* Category Tabs */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {reportCategories.map((c) => {
          const Icon = c.icon;
          const isSelected = selectedType === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedType(c.id)}
              className={`flex flex-col text-left rounded-xl border p-4 transition ${
                isSelected
                  ? "border-cyan-400 bg-cyan-400/10 shadow-sm"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon size={18} className={isSelected ? "text-cyan-300" : "text-slate-400"} />
                <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-300"}`}>
                  {c.label}
                </span>
              </div>
              <span className="mt-2 text-[11px] text-slate-400 leading-snug line-clamp-2">
                {c.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Report Preview */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardContent className="p-0">
          <div className="border-b border-slate-800 p-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">{activeCategory.label}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{activeCategory.description}</p>
            </div>
            <span className="font-mono text-xs rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-cyan-300">
              {reportData.length} Records Compiled
            </span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-400" />
                <p className="mt-3 text-sm text-slate-400">Compiling report data...</p>
              </div>
            ) : reportData.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/60 uppercase text-slate-400">
                  <tr>
                    {Object.keys(reportData[0])
                      .slice(0, 6)
                      .map((col) => (
                        <th key={col} className="p-3.5 font-semibold">
                          {col.replace(/([A-Z])/g, " $1")}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {reportData.slice(0, 15).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      {Object.entries(row)
                        .slice(0, 6)
                        .map(([k, v], cellIdx) => (
                          <td key={cellIdx} className="p-3.5 text-slate-300 truncate max-w-[200px]">
                            {typeof v === "boolean"
                              ? v
                                ? "YES"
                                : "NO"
                              : v === null || v === undefined
                              ? "—"
                              : String(v)}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-16 text-center text-sm text-slate-400">
                No records available in this report view.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
