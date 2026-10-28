import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  LayoutDashboard,
  Cpu,
  Flame,
  FileCheck2,
  Leaf,
  ClipboardList,
  FileSpreadsheet,
  Users,
  Settings,
  PlusCircle,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useAppData } from "@/hooks/use-app-data";
import { api } from "@/lib/api";
import type { Role } from "@/lib/models";

interface NavConfigItem {
  label: string;
  to: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV_CONFIG: Record<string, NavConfigItem[]> = {
  OWNER: [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Assets", to: "/admin/assets", icon: Cpu },
    { label: "Wipe Jobs", to: "/admin/jobs", icon: Flame },
    { label: "Certificates", to: "/admin/certificates", icon: FileCheck2 },
    { label: "Recycling", to: "/admin/recycling", icon: Leaf },
    { label: "Audit Trail", to: "/admin/audit", icon: ClipboardList },
    { label: "Reports", to: "/admin/reports", icon: FileSpreadsheet },
    { label: "Users & Team", to: "/admin/users", icon: Users },
    { label: "Settings", to: "/admin/settings", icon: Settings },
  ],
  ADMINISTRATOR: [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Assets", to: "/admin/assets", icon: Cpu },
    { label: "Wipe Jobs", to: "/admin/jobs", icon: Flame },
    { label: "Certificates", to: "/admin/certificates", icon: FileCheck2 },
    { label: "Recycling", to: "/admin/recycling", icon: Leaf },
    { label: "Audit Trail", to: "/admin/audit", icon: ClipboardList },
    { label: "Reports", to: "/admin/reports", icon: FileSpreadsheet },
    { label: "Users & Team", to: "/admin/users", icon: Users },
    { label: "Settings", to: "/admin/settings", icon: Settings },
  ],
  ADMIN: [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Assets", to: "/admin/assets", icon: Cpu },
    { label: "Wipe Jobs", to: "/admin/jobs", icon: Flame },
    { label: "Certificates", to: "/admin/certificates", icon: FileCheck2 },
    { label: "Recycling", to: "/admin/recycling", icon: Leaf },
    { label: "Audit Trail", to: "/admin/audit", icon: ClipboardList },
    { label: "Reports", to: "/admin/reports", icon: FileSpreadsheet },
    { label: "Users & Team", to: "/admin/users", icon: Users },
    { label: "Settings", to: "/admin/settings", icon: Settings },
  ],
  CREATOR: [
    { label: "Dashboard", to: "/employee", icon: LayoutDashboard, exact: true },
    { label: "Register Device", to: "/employee/register", icon: PlusCircle },
    { label: "Assets", to: "/admin/assets", icon: Cpu },
    { label: "Reports", to: "/admin/reports", icon: FileSpreadsheet },
  ],
  AUTHOR: [
    { label: "Dashboard", to: "/employee", icon: LayoutDashboard, exact: true },
    { label: "Certificates", to: "/employee/certificates", icon: FileCheck2 },
    { label: "Reports", to: "/admin/reports", icon: FileSpreadsheet },
  ],
  TECHNICIAN: [
    { label: "Dashboard", to: "/employee", icon: LayoutDashboard, exact: true },
    { label: "Register Device", to: "/employee/register", icon: PlusCircle },
    { label: "Wipe Jobs", to: "/employee/jobs", icon: Flame },
    { label: "Certificates", to: "/employee/certificates", icon: FileCheck2 },
    { label: "Recycling", to: "/employee/recycling", icon: Leaf },
    { label: "Audit Trail", to: "/employee/audit", icon: ClipboardList },
  ],
  OPERATOR: [
    { label: "Dashboard", to: "/employee", icon: LayoutDashboard, exact: true },
    { label: "Register Device", to: "/employee/register", icon: PlusCircle },
    { label: "Wipe Jobs", to: "/employee/jobs", icon: Flame },
    { label: "Certificates", to: "/employee/certificates", icon: FileCheck2 },
    { label: "Recycling", to: "/employee/recycling", icon: Leaf },
    { label: "Audit Trail", to: "/employee/audit", icon: ClipboardList },
  ],
  EMPLOYEE: [
    { label: "Dashboard", to: "/employee", icon: LayoutDashboard, exact: true },
    { label: "Register Device", to: "/employee/register", icon: PlusCircle },
    { label: "Wipe Jobs", to: "/employee/jobs", icon: Flame },
    { label: "Certificates", to: "/employee/certificates", icon: FileCheck2 },
    { label: "Recycling", to: "/employee/recycling", icon: Leaf },
    { label: "Audit Trail", to: "/employee/audit", icon: ClipboardList },
  ],
  AUDITOR: [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Assets", to: "/admin/assets", icon: Cpu },
    { label: "Recycling", to: "/admin/recycling", icon: Leaf },
    { label: "Audit Trail", to: "/admin/audit", icon: ClipboardList },
    { label: "Reports", to: "/admin/reports", icon: FileSpreadsheet },
  ],
  USER: [
    { label: "My Devices", to: "/customer", icon: Cpu, exact: true },
    { label: "Certificates", to: "/customer/certificates", icon: FileCheck2 },
    { label: "Verify", to: "/verify", icon: CheckCircle2 },
  ],
  CUSTOMER: [
    { label: "My Devices", to: "/customer", icon: Cpu, exact: true },
    { label: "Certificates", to: "/customer/certificates", icon: FileCheck2 },
    { label: "Verify", to: "/verify", icon: CheckCircle2 },
  ],
};

export const homeFor = (role?: Role | string): string => {
  const r = (role || "").toUpperCase();
  if (r === "OWNER" || r === "ADMIN" || r === "ADMINISTRATOR" || r === "AUDITOR") return "/admin";
  if (r === "OPERATOR" || r === "EMPLOYEE" || r === "TECHNICIAN" || r === "CREATOR" || r === "AUTHOR") return "/employee";
  if (r === "CUSTOMER" || r === "USER") return "/customer";
  return "/customer";
};

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { data } = useAppData();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<
    { type: string; label: string; sub: string; to: string }[]
  >([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live search handler
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }

    const results: { type: string; label: string; sub: string; to: string }[] = [];

    // Search Assets
    data.devices.forEach((d) => {
      const tag = d.assetId || d.assetTag || "";
      const model = `${d.make || d.manufacturer || ""} ${d.model || d.name || ""}`.trim();
      const serial = d.serialNumber || "";
      if (tag.toLowerCase().includes(q) || model.toLowerCase().includes(q) || serial.toLowerCase().includes(q)) {
        results.push({
          type: "Asset",
          label: tag,
          sub: model || serial,
          to: user?.role === "CUSTOMER" ? "/customer" : "/admin/assets",
        });
      }
    });

    // Search Certificates
    data.certificates.forEach((c) => {
      const num = c.certificateNumber || c.id || "";
      if (num.toLowerCase().includes(q)) {
        results.push({
          type: "Certificate",
          label: num,
          sub: c.status || "Signed",
          to: user?.role === "CUSTOMER" ? "/customer/certificates" : "/admin/certificates",
        });
      }
    });

    // Search Wipe Jobs
    data.wipeJobs.forEach((w) => {
      const jId = w.id || "";
      if (jId.toLowerCase().includes(q) || (w.wipeMethod || "").toLowerCase().includes(q)) {
        results.push({
          type: "Wipe Job",
          label: jId,
          sub: w.wipeMethod || "Sanitization",
          to: user?.role === "CUSTOMER" ? "/customer" : "/admin/jobs",
        });
      }
    });

    setSearchResults(results.slice(0, 10));
  }, [searchQuery, data, user?.role]);

  if (!user) return null;

  const userRoleKey = (user.role || "ADMIN").toUpperCase();
  const navItems = NAV_CONFIG[userRoleKey] || NAV_CONFIG.ADMIN;
  const unreadCount = data.notifications.filter((n) => !n.read && !n.isRead).length;

  const isLinkActive = (item: NavConfigItem) => {
    if (item.exact) {
      return location.pathname === item.to;
    }
    // Support aliases: e.g. /devices maps to /admin/assets
    if (item.to === "/admin/assets" && location.pathname === "/devices") return true;
    if (item.to === "/admin/jobs" && location.pathname === "/wipe-jobs") return true;
    if (item.to === "/admin/certificates" && location.pathname === "/certificates") return true;
    if (item.to === "/admin/recycling" && location.pathname === "/recycling") return true;
    if (item.to === "/admin/audit" && location.pathname === "/audit-log") return true;
    if (item.to === "/admin/reports" && location.pathname === "/reports") return true;
    if (item.to === "/admin/users" && location.pathname === "/users") return true;
    if (item.to === "/admin/settings" && location.pathname === "/settings") return true;

    return location.pathname === item.to || location.pathname.startsWith(item.to + "/");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/10 bg-slate-900/90 backdrop-blur transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-500 shadow-md shadow-cyan-500/20">
              <ShieldCheck className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-white">ZeroTrace AI</p>
              <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-mono">
                Secure. Verify. Prove.
              </p>
            </div>
          </Link>
          <button
            type="button"
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 p-3 overflow-y-auto flex-1">
          {navItems.map((item) => {
            const active = isLinkActive(item);
            return (
              <Link
                key={item.to + item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-cyan-500/10 text-cyan-300 font-semibold"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Landing Page Link */}
        <div className="mt-auto border-t border-white/10 p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Landing Page</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/10 bg-slate-950/80 px-4 backdrop-blur lg:px-8">
          <button
            type="button"
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search Input with dropdown preview */}
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                placeholder="Search asset, serial, certificate, job…"
                className="w-full rounded-lg border border-white/10 bg-slate-900/60 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none transition"
              />
            </div>

            {searchFocused && searchResults.length > 0 && (
              <div className="absolute mt-2 w-full overflow-hidden rounded-lg border border-white/10 bg-slate-900 shadow-2xl z-50">
                {searchResults.map((r, i) => (
                  <Link
                    key={i}
                    to={r.to}
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="flex items-center justify-between px-3 py-2 text-sm hover:bg-white/5 transition"
                  >
                    <div>
                      <p className="text-slate-200 font-medium">{r.label}</p>
                      <p className="text-xs text-slate-500">{r.sub}</p>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono font-semibold">{r.type}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="ml-auto flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-bold text-slate-950">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl z-50">
                  <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white flex items-center justify-between">
                    <span>Notifications</span>
                    <span className="text-xs text-cyan-400 font-normal">
                      {unreadCount} unread
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {data.notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-slate-500">
                        No notifications
                      </p>
                    ) : (
                      data.notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className={`flex w-full flex-col gap-1 border-b border-white/5 px-4 py-3 text-left hover:bg-white/5 transition ${
                            !n.read && !n.isRead ? "bg-cyan-500/5" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-200">{n.title}</span>
                            <span
                              className={`h-2 w-2 rounded-full ${
                                n.type === "CRITICAL"
                                  ? "bg-red-400"
                                  : n.type === "WARNING"
                                  ? "bg-amber-400"
                                  : "bg-cyan-400"
                              }`}
                            />
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : "Just now"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1.5 backdrop-blur">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-xs font-bold text-slate-950">
                {(user.name || user.fullName || "U").charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-slate-200">
                  {user.fullName || user.name || "User"}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono font-semibold">
                  {user.role}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-4 lg:p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
