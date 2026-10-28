import { RotateCcw, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared";
import { useAuth } from "@/lib/auth";
import { resetData } from "@/lib/data";
export function Settings() { return <><PageHeader title="Settings" description="Prototype controls and environment information."/><Card className="max-w-2xl border-slate-800 bg-slate-900/60"><CardContent className="p-6"><h2 className="font-semibold">Demo data</h2><p className="mt-2 text-sm text-slate-400">Reset all locally stored prototype records to the deterministic seed dataset. You will be signed out.</p><Button variant="outline" className="mt-5 border-rose-400/30 text-rose-200" onClick={() => { resetData(); localStorage.removeItem("zerotrace-user"); window.location.href = "/login"; }}><RotateCcw/>Reset demo data</Button></CardContent></Card></>; }
export function Profile() { const { user } = useAuth(); return <><PageHeader title="Profile" description="Your current demo identity and access scope."/><Card className="max-w-xl border-slate-800 bg-slate-900/60"><CardContent className="flex gap-5 p-6"><UserCircle className="h-14 w-14 text-cyan-300"/><div><h2 className="text-xl font-semibold">{user?.name}</h2><p className="mt-1 text-slate-400">{user?.email}</p><span className="mt-4 inline-block rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">{user?.role === "EMPLOYEE" ? "Employee / Operator" : user?.role}</span></div></CardContent></Card></>; }
