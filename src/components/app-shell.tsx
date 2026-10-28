import { Link, NavLink, useNavigate } from "react-router-dom";
import { BarChart3, CheckCircle2, ClipboardList, Cpu, FileCheck2, Gauge, Leaf, LogOut, Menu, Settings, ShieldCheck, UserCircle, X, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { roleLabel } from "@/lib/data";
import type { Role } from "@/lib/models";

type NavItem = { to: string; label: string; icon: LucideIcon; roles: Role[] };
const items: NavItem[] = [
  { to: "/admin-dashboard", label: "Overview", icon: Gauge, roles: ["ADMIN"] },
  { to: "/employee-dashboard", label: "Operations", icon: Gauge, roles: ["EMPLOYEE"] },
  { to: "/customer-dashboard", label: "My workspace", icon: Gauge, roles: ["CUSTOMER"] },
  { to: "/devices", label: "Devices", icon: Cpu, roles: ["ADMIN", "EMPLOYEE", "CUSTOMER"] },
  { to: "/wipe-jobs", label: "Wipe jobs", icon: ShieldCheck, roles: ["ADMIN", "EMPLOYEE"] },
  { to: "/verification", label: "Verification", icon: CheckCircle2, roles: ["ADMIN", "EMPLOYEE", "CUSTOMER"] },
  { to: "/certificates", label: "Certificates", icon: FileCheck2, roles: ["ADMIN", "EMPLOYEE", "CUSTOMER"] },
  { to: "/audit-log", label: "Audit trail", icon: ClipboardList, roles: ["ADMIN"] },
  { to: "/recycling", label: "Recycling", icon: Leaf, roles: ["ADMIN", "EMPLOYEE"] },
  { to: "/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
];
export const homeFor = (role: Role) => role === "ADMIN" ? "/admin-dashboard" : role === "EMPLOYEE" ? "/employee-dashboard" : "/customer-dashboard";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth(); const navigate = useNavigate(); const [open, setOpen] = useState(false);
  if (!user) return null;
  const nav = <nav className="space-y-1">{items.filter((x) => x.roles.includes(user.role)).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive ? "bg-cyan-400/15 text-cyan-300" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}><Icon size={18} />{label}</NavLink>)}</nav>;
  return <div className="min-h-screen bg-[#07111f] text-slate-100">
    {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-[#0a1628] p-5 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-8 flex items-center justify-between"><Link to={homeFor(user.role)} className="flex items-center gap-2 text-lg font-bold tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-400 text-slate-950"><ShieldCheck size={22} /></span>ZEROTrace <span className="text-cyan-300">AI</span></Link><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)}><X /></Button></div>
      {nav}<div className="mt-auto border-t border-slate-800 pt-4"><Link to="/profile" className="mb-3 flex items-center gap-3 rounded-lg p-2 hover:bg-slate-800"><UserCircle className="text-cyan-300" /><span className="min-w-0"><span className="block truncate text-sm font-medium">{user.name}</span><span className="block text-xs text-slate-400">{roleLabel(user.role)}</span></span></Link><Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white" onClick={() => { logout(); navigate("/login"); }}><LogOut />Sign out</Button></div>
    </aside>
    <main className="min-h-screen lg:pl-72"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-[#07111f]/95 px-4 backdrop-blur lg:px-8"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}><Menu /></Button><div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex"><BarChart3 size={16} className="text-cyan-300" />Secure sanitization operations</div><div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">DEMO ENVIRONMENT</div></header><div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div></main>
  </div>;
}
