import {
  Plus,
  Sparkles,
  HardDrive,
  Cpu,
  Search,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader, StatusBadge } from "@/components/shared";
import { useAppData } from "@/hooks/use-app-data";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { recommendation } from "@/lib/data";
import type { Device } from "@/lib/models";

export default function Devices() {
  const { data, refresh, update } = useAppData();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const isCustomer = user?.role === "CUSTOMER";
  const visible = isCustomer
    ? data.devices.filter((d) => d.ownerId === user?.id)
    : data.devices;

  const filtered = visible.filter(
    (d) =>
      d.assetId?.toLowerCase().includes(search.toLowerCase()) ||
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.serialNumber?.toLowerCase().includes(search.toLowerCase()) ||
      d.storageType?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedDevice = data.devices.find((d) => d.id === selectedId) || filtered[0] || null;
  const staticRec = selectedDevice ? recommendation(selectedDevice as any) : null;
  const rec = aiAnalysis || staticRec;

  const handleSelectDevice = async (d: Device) => {
    setSelectedId(d.id);
    setAiAnalysis(null);
    setAnalyzing(true);
    try {
      const res = await api.assets.analyzeAsset(d.id);
      if (res.success && res.analysis) {
        setAiAnalysis({
          method: res.analysis.recommendedMethod,
          security: res.analysis.securityLevel,
          duration: res.analysis.estimatedDurationMinutes,
          strategy: res.analysis.verificationStrategy,
          reason: res.analysis.reasoning,
          confidence: res.analysis.confidenceScore,
          nistStandard: res.analysis.nistStandard,
        });
      }
    } catch {
      // staticRec will be displayed gracefully
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddDevice = async (form: HTMLFormElement) => {
    setSubmitting(true);
    const fd = new FormData(form);

    const assetPayload = {
      assetTag: String(fd.get("asset")),
      name: String(fd.get("name")),
      model: String(fd.get("name")),
      make: "Generic",
      deviceType: String(fd.get("type")),
      serialNumber: String(fd.get("serial")),
      operatingSystem: String(fd.get("os")),
      storageType: String(fd.get("storage")),
      storageCapacityGb: Number(fd.get("capacity")),
      isEncrypted: fd.get("encryption") === "Enabled",
      condition: fd.get("health") === "Attention" ? "POOR" : fd.get("health") === "Good" ? "FAIR" : "GOOD",
    };

    try {
      const res = await api.assets.createAsset(assetPayload);
      if (res.success) {
        setAdding(false);
        await refresh();
        form.reset();
        return;
      }
    } catch (err: any) {
      console.warn("API asset creation fallback to local store:", err?.message || err);
    }

    // Fallback local update
    const newId = `dev-${Date.now().toString(36)}`;
    update((d) => {
      const newDev: Device = {
        id: newId,
        assetId: assetPayload.assetTag,
        name: assetPayload.name,
        type: assetPayload.deviceType,
        serialNumber: assetPayload.serialNumber,
        operatingSystem: assetPayload.operatingSystem,
        storageType: assetPayload.storageType as any,
        capacityGb: assetPayload.storageCapacityGb,
        encryption: assetPayload.isEncrypted ? "Enabled" : "Disabled",
        health: "Good",
        status: "REGISTERED",
        ownerId: user?.id || "usr-customer",
        assignedToId: "usr-operator",
        createdAt: new Date().toISOString(),
      };
      d.devices.unshift(newDev);
    });

    setAdding(false);
    setSubmitting(false);
  };

  return (
    <>
      <PageHeader
        title="Asset Management & Device Intake"
        description="Register, inspect hardware storage specifications, and obtain explainable NIST SP 800-88 sanitization recommendations."
        action={
          !isCustomer ? (
            <Button
              onClick={() => setAdding(!adding)}
              className="bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300"
            >
              <Plus className="mr-1 h-4 w-4" />
              {adding ? "Cancel" : "Register IT Asset"}
            </Button>
          ) : undefined
        }
      />

      {/* New Device Form */}
      {adding && (
        <Card className="mb-6 border-cyan-400/40 bg-slate-900/90 shadow-lg shadow-cyan-400/5">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Intake New IT Asset</h2>
              <span className="text-xs text-cyan-300">NIST SP 800-88 Spec Intake</span>
            </div>

            <form
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddDevice(e.currentTarget);
              }}
            >
              <div>
                <label className="text-xs text-slate-400">Asset Tag / Identifier</label>
                <Input required name="asset" placeholder="e.g. APX-LT-5021" className="mt-1 border-slate-700 bg-slate-950" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Device Model / Make</label>
                <Input required name="name" placeholder="e.g. ThinkPad X1 Carbon" className="mt-1 border-slate-700 bg-slate-950" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Serial Number</label>
                <Input required name="serial" placeholder="e.g. TP-9941X-8B" className="mt-1 border-slate-700 bg-slate-950" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Operating System</label>
                <Input required name="os" placeholder="e.g. Windows 11 Enterprise" className="mt-1 border-slate-700 bg-slate-950" />
              </div>

              <div>
                <label className="text-xs text-slate-400">Device Classification</label>
                <select name="type" className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                  <option value="Laptop">Laptop / Notebook</option>
                  <option value="Desktop">Desktop Workstation</option>
                  <option value="Server">Enterprise Rack Server</option>
                  <option value="Storage Array">SAN / NAS Storage Shelf</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400">Storage Architecture</label>
                <select name="storage" className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                  <option value="NVMe">NVMe PCIe SSD</option>
                  <option value="SSD">SATA Solid-State Drive (SSD)</option>
                  <option value="HDD">Magnetic Hard Disk Drive (HDD)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400">Drive Capacity (GB)</label>
                <Input required type="number" min={64} defaultValue={512} name="capacity" className="mt-1 border-slate-700 bg-slate-950" />
              </div>

              <div>
                <label className="text-xs text-slate-400">Hardware Encryption (SED)</label>
                <select name="encryption" className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                  <option value="Enabled">Enabled (TCG Opal / BitLocker)</option>
                  <option value="Disabled">Disabled / None</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" className="border-slate-700" onClick={() => setAdding(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Complete Registration & Queue AI Analysis"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter Bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by asset tag, model, serial..."
            className="pl-9 border-slate-800 bg-slate-900/80 text-sm text-white"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Total inventory: <b className="text-cyan-300">{visible.length}</b> devices</span>
        </div>
      </div>

      {/* Main Grid: Assets Table + AI Recommendation Panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Assets Table */}
        <Card className="border-slate-800 bg-slate-900/60 lg:col-span-2">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/90 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="p-4">Asset / Hardware</th>
                  <th className="p-4">Storage Spec</th>
                  <th className="p-4">Encryption</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((d) => {
                  const isSel = (selectedDevice?.id === d.id);
                  return (
                    <tr
                      key={d.id}
                      onClick={() => handleSelectDevice(d)}
                      className={`cursor-pointer transition hover:bg-slate-800/40 ${
                        isSel ? "bg-cyan-500/10 border-l-2 border-l-cyan-400" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <Cpu size={15} className="text-cyan-400" />
                          {d.assetId}
                        </div>
                        <span className="block text-xs text-slate-400 mt-0.5">
                          {d.name} · S/N: {d.serialNumber}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-slate-200">{d.storageType}</span>
                        <span className="block text-xs text-slate-400">{d.capacityGb} GB</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center text-xs font-medium ${
                          d.encryption === "Enabled" ? "text-emerald-300" : "text-slate-400"
                        }`}>
                          {d.encryption === "Enabled" ? "TCG/Opal Encrypted" : "Unencrypted"}
                        </span>
                      </td>
                      <td className="p-4">
                        <StatusBadge value={d.status} />
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-sm text-slate-400">
                      No matching devices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* AI Explainable Recommendation Side Panel */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardContent className="p-6">
            {selectedDevice && rec ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="font-bold text-white text-base">{selectedDevice.name}</h2>
                    <p className="mt-0.5 font-mono text-xs text-cyan-300">
                      {selectedDevice.assetId} · {selectedDevice.operatingSystem}
                    </p>
                  </div>
                  <StatusBadge value={selectedDevice.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
                    <span className="text-slate-500">Storage Class</span>
                    <p className="font-semibold text-slate-200 mt-0.5">{selectedDevice.storageType} ({selectedDevice.capacityGb} GB)</p>
                  </div>
                  <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800">
                    <span className="text-slate-500">Hardware Health</span>
                    <p className="font-semibold text-slate-200 mt-0.5">{selectedDevice.health || "Good"}</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-800 pt-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-cyan-300 text-sm">
                      <Sparkles size={16} />
                      <span>AI Sanitization Engine</span>
                    </div>
                    {analyzing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-300" />
                    ) : (
                      <span className="rounded-full bg-cyan-950 border border-cyan-800/80 px-2 py-0.5 text-[11px] font-mono text-cyan-300">
                        {rec.confidence || 95}% Confidence
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[11px] text-slate-400">
                    NIST SP 800-88 Rev. 2 & IEEE 2883-2022 algorithmic guidance.
                  </p>

                  <dl className="mt-4 space-y-3.5 text-xs">
                    <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
                      <dt className="text-slate-500 font-medium">Recommended Standard & Method</dt>
                      <dd className="mt-1 font-semibold text-white flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        {rec.method}
                      </dd>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-2.5">
                        <dt className="text-slate-500">Security Clearance</dt>
                        <dd className="font-semibold text-cyan-300 mt-0.5">{rec.security || "High"}</dd>
                      </div>
                      <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-2.5">
                        <dt className="text-slate-500">Est. Wipe Duration</dt>
                        <dd className="font-semibold text-slate-200 mt-0.5">~{rec.duration || 18} mins</dd>
                      </div>
                    </div>

                    <div>
                      <dt className="text-slate-500">Verification Strategy</dt>
                      <dd className="mt-1 text-slate-300">{rec.strategy}</dd>
                    </div>

                    <div>
                      <dt className="text-slate-500">Engine Reasoning</dt>
                      <dd className="mt-1 text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                        {rec.reason}
                      </dd>
                    </div>
                  </dl>

                  {!isCustomer && (
                    <Button asChild className="mt-5 w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-semibold" size="sm">
                      <Link to="/wipe-jobs">
                        Launch Wipe for {selectedDevice.assetId} →
                      </Link>
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-sm text-slate-400">
                <HardDrive className="mx-auto mb-3 text-slate-600" size={32} />
                Select any asset from the inventory to view hardware specifications and AI recommendations.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
