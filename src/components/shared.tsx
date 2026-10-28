import { AlertTriangle, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1><p className="mt-1 text-sm text-slate-400">{description}</p></div>{action}</div>; }
export function StatusBadge({ value, status }: { value?: string; status?: string }) {
  const val = (value || status || "REGISTERED").toString();
  const good = /VERIFIED|CERTIFIED|READY|COMPLETED|PASS|VALID|APPROVED/.test(val);
  const bad = /FAILED|FAIL|REVOKED|REJECTED/.test(val);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
        good
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
          : bad
          ? "border-rose-400/25 bg-rose-400/10 text-rose-300"
          : "border-amber-400/25 bg-amber-400/10 text-amber-200"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {val.replaceAll("_", " ")}
    </span>
  );
}
export function EmptyState({ title, description, link }: { title: string; description: string; link?: string }) { return <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-10 text-center"><ShieldCheck className="mx-auto mb-3 text-slate-500" size={32}/><h3 className="font-semibold">{title}</h3><p className="mx-auto mt-1 max-w-md text-sm text-slate-400">{description}</p>{link && <Link to={link} className="mt-4 inline-block text-sm text-cyan-300 hover:underline">Continue</Link>}</div>; }
export const IconForStatus = ({ failed }: { failed?: boolean }) => failed ? <AlertTriangle className="text-rose-300" /> : <CheckCircle2 className="text-emerald-300" />;
export const Clock = Clock3;
