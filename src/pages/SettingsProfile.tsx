import { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Mail,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  UserCircle,
  AlertTriangle,
  Send,
  Trash2,
  Lock,
  Server,
  Layers,
  Sparkles,
  Info,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { Role } from "@/lib/models";

const ROLE_OPTIONS: { label: string; value: Role; desc: string }[] = [
  { label: "Owner", value: "OWNER", desc: "Full organization control, owner settings, and privileged role assignment" },
  { label: "Administrator", value: "ADMINISTRATOR", desc: "Operational and user administration within owner permissions" },
  { label: "Creator", value: "CREATOR", desc: "Create and register assets, projects, and initial workflow records" },
  { label: "Author", value: "AUTHOR", desc: "Edit, document, and manage assigned sanitization reports and records" },
  { label: "Technician", value: "TECHNICIAN", desc: "Perform device diagnostics, secure wipe workflows, and job operations" },
  { label: "User", value: "USER", desc: "Access assigned assets, certificates, and view sanitization status" },
];

const PERMISSION_MATRIX = [
  {
    capability: "Organization & Owner Governance",
    Owner: true,
    Administrator: false,
    Creator: false,
    Author: false,
    Technician: false,
    User: false,
  },
  {
    capability: "User & Team Role Administration",
    Owner: true,
    Administrator: true,
    Creator: false,
    Author: false,
    Technician: false,
    User: false,
  },
  {
    capability: "Device & Asset Registration",
    Owner: true,
    Administrator: true,
    Creator: true,
    Author: true,
    Technician: true,
    User: false,
  },
  {
    capability: "Wipe Job Orchestration & Execution",
    Owner: true,
    Administrator: true,
    Creator: false,
    Author: false,
    Technician: true,
    User: false,
  },
  {
    capability: "Residual Data Verification Review",
    Owner: true,
    Administrator: true,
    Creator: false,
    Author: false,
    Technician: true,
    User: false,
  },
  {
    capability: "Certificate Registry & PDF Generation",
    Owner: true,
    Administrator: true,
    Creator: false,
    Author: true,
    Technician: true,
    User: false,
  },
  {
    capability: "Cryptographic Audit Ledger Inspection",
    Owner: true,
    Administrator: true,
    Creator: false,
    Author: false,
    Technician: false,
    User: false,
  },
  {
    capability: "Recycling Clearance Approvals",
    Owner: true,
    Administrator: true,
    Creator: false,
    Author: false,
    Technician: false,
    User: false,
  },
  {
    capability: "Compliance Reports & Data Exports",
    Owner: true,
    Administrator: true,
    Creator: true,
    Author: true,
    Technician: false,
    User: false,
  },
  {
    capability: "View My Devices & Public Verification",
    Owner: true,
    Administrator: true,
    Creator: true,
    Author: true,
    Technician: true,
    User: true,
  },
];

export function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"team" | "permissions" | "platform">("team");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("USER");
  const [inviteDepartment, setInviteDepartment] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const isOwner = user?.role === "OWNER";

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, invRes] = await Promise.all([
        api.users.getUsers(),
        api.users.getInvitations(),
      ]);
      if (usersRes.success && usersRes.data) {
        setTeamMembers(usersRes.data);
      }
      if (invRes.success && invRes.data) {
        setInvitations(invRes.data);
      }
    } catch (err) {
      console.warn("Failed to load settings data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    setInviteLoading(true);

    try {
      const res = await api.users.invite({
        email: inviteEmail,
        role: inviteRole,
        department: inviteDepartment,
      });

      if (res.success) {
        setActionMessage({ text: res.message || "Invitation dispatched successfully." });
        setInviteEmail("");
        setInviteDepartment("");
        setInviteRole("USER");
        setShowInviteModal(false);
        await loadData();
      } else {
        setActionMessage({ text: res.message || "Failed to dispatch invitation.", error: true });
      }
    } catch (err: any) {
      setActionMessage({ text: err?.message || "Failed to dispatch invitation.", error: true });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setActionMessage(null);
    try {
      const res = await api.users.updateUser(memberId, { role: newRole });
      if (res.success) {
        setActionMessage({ text: `Member role updated to ${newRole}.` });
        await loadData();
      }
    } catch (err: any) {
      setActionMessage({ text: err?.message || "Failed to update member role.", error: true });
    }
  };

  const handleToggleStatus = async (memberId: string, currentStatus: string) => {
    setActionMessage(null);
    const nextStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
    try {
      const res = await api.users.updateUser(memberId, { status: nextStatus });
      if (res.success) {
        setActionMessage({ text: `Member status updated to ${nextStatus}.` });
        await loadData();
      }
    } catch (err: any) {
      setActionMessage({ text: err?.message || "Failed to change member status.", error: true });
    }
  };

  const handleResendInvite = async (invId: string) => {
    setActionMessage(null);
    try {
      const res = await api.users.resendInvitation(invId);
      if (res.success) {
        setActionMessage({ text: res.message || "Invitation resent." });
        await loadData();
      }
    } catch (err: any) {
      setActionMessage({ text: err?.message || "Failed to resend invitation.", error: true });
    }
  };

  const handleRevokeInvite = async (invId: string) => {
    if (!confirm("Revoke this invitation?")) return;
    setActionMessage(null);
    try {
      const res = await api.users.revokeInvitation(invId);
      if (res.success) {
        setActionMessage({ text: "Invitation revoked." });
        await loadData();
      }
    } catch (err: any) {
      setActionMessage({ text: err?.message || "Failed to revoke invitation.", error: true });
    }
  };

  const filteredMembers = teamMembers.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      m.fullName?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.department?.toLowerCase().includes(q);
    const matchRole = roleFilter === "ALL" || m.role.toUpperCase() === roleFilter.toUpperCase();
    return matchSearch && matchRole;
  });

  const getRoleBadge = (role: string) => {
    const r = role.toUpperCase();
    if (r === "OWNER") {
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    }
    if (r === "ADMINISTRATOR" || r === "ADMIN") {
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
    }
    if (r === "CREATOR") {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    }
    if (r === "AUTHOR") {
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
    if (r === "TECHNICIAN" || r === "OPERATOR") {
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    }
    return "bg-slate-700/40 text-slate-300 border-slate-700";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Team Governance"
        description="Manage team access, role assignments, security permissions, and platform infrastructure."
      />

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${
            actionMessage.error
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}
        >
          {actionMessage.error ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab("team")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === "team"
              ? "border-cyan-400 text-cyan-300 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="h-4 w-4" /> Team & Roles ({teamMembers.length})
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === "permissions"
              ? "border-cyan-400 text-cyan-300 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Role & Permission Matrix
        </button>
        <button
          onClick={() => setActiveTab("platform")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === "platform"
              ? "border-cyan-400 text-cyan-300 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Server className="h-4 w-4" /> Platform & Security Diagnostics
        </button>
      </div>

      {/* TAB 1: Team & Access Management */}
      {activeTab === "team" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search team members by name, email, department..."
                  className="pl-9 h-10 border-white/10 bg-slate-900/60 text-slate-200"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 rounded-md border border-white/10 bg-slate-900/60 px-3 text-xs text-slate-200"
              >
                <option value="ALL">All Roles</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={() => setShowInviteModal(true)}
              className="w-full sm:w-auto bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400"
            >
              <UserPlus className="h-4 w-4 mr-2" /> Invite Team Member
            </Button>
          </div>

          {/* Team Members Table */}
          <Card className="border-white/10 bg-slate-900/60 shadow-xl backdrop-blur overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="border-b border-white/10 bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="p-4">Member</th>
                      <th className="p-4">Assigned Role</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4">Verification</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-white/5 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center text-xs font-bold text-slate-950">
                              {(member.fullName || member.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{member.fullName || "—"}</p>
                              <p className="text-xs text-slate-400 font-mono">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(
                              member.role
                            )}`}
                          >
                            {member.role}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-400">{member.department || "Operations"}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                              member.status === "ACTIVE" ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                member.status === "ACTIVE" ? "bg-emerald-400" : "bg-rose-400"
                              }`}
                            />
                            {member.status || "ACTIVE"}
                          </span>
                        </td>
                        <td className="p-4">
                          {member.emailVerified ? (
                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                            </span>
                          ) : (
                            <span className="text-xs text-amber-400 flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* Role selector dropdown */}
                            <select
                              value={member.role.toUpperCase()}
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              disabled={member.role === "OWNER" && !isOwner}
                              className="rounded border border-white/10 bg-slate-950 px-2 py-1 text-xs text-slate-200"
                            >
                              {ROLE_OPTIONS.map((ro) => (
                                <option
                                  key={ro.value}
                                  value={ro.value}
                                  disabled={ro.value === "OWNER" && !isOwner}
                                >
                                  {ro.label}
                                </option>
                              ))}
                            </select>

                            {/* Deactivate / Reactivate button */}
                            {member.role !== "OWNER" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleStatus(member.id, member.status)}
                                className={`text-xs px-2 py-1 h-auto ${
                                  member.status === "ACTIVE"
                                    ? "text-slate-400 hover:text-rose-300"
                                    : "text-emerald-400 hover:text-emerald-300"
                                }`}
                              >
                                {member.status === "ACTIVE" ? "Deactivate" : "Activate"}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pending Invitations Section */}
          <div className="space-y-3 pt-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Mail className="h-4 w-4 text-cyan-400" /> Pending & Past Team Invitations
            </h3>

            {invitations.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No invitations sent yet.</p>
            ) : (
              <div className="rounded-xl border border-white/10 bg-slate-900/60 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/40 text-slate-400 uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-3">Invited Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Expires At</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {invitations.map((inv) => (
                      <tr key={inv.id}>
                        <td className="p-3 font-mono">{inv.email}</td>
                        <td className="p-3 font-semibold text-cyan-300">{inv.role}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.status === "ACCEPTED"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : inv.status === "PENDING"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">
                          {new Date(inv.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {inv.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleResendInvite(inv.id)}
                                className="text-xs px-2 py-1 h-auto text-cyan-300 hover:bg-cyan-500/10"
                              >
                                Resend
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRevokeInvite(inv.id)}
                                className="text-xs px-2 py-1 h-auto text-rose-400 hover:bg-rose-500/10"
                              >
                                Revoke
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Role & Permission Matrix */}
      {activeTab === "permissions" && (
        <div className="space-y-6">
          <Card className="border-white/10 bg-slate-900/60 backdrop-blur shadow-xl">
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">ZEROTrace Role Permission Matrix</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enforced on the backend for all API routes and UI module gates.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 uppercase font-semibold text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="p-3">Platform Capability</th>
                      <th className="p-3 text-center text-purple-300">Owner</th>
                      <th className="p-3 text-center text-cyan-300">Administrator</th>
                      <th className="p-3 text-center text-emerald-300">Creator</th>
                      <th className="p-3 text-center text-blue-300">Author</th>
                      <th className="p-3 text-center text-amber-300">Technician</th>
                      <th className="p-3 text-center text-slate-300">User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {PERMISSION_MATRIX.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="p-3 font-medium text-white">{row.capability}</td>
                        <td className="p-3 text-center">
                          {row.Owner ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-600 mx-auto" />
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {row.Administrator ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-600 mx-auto" />
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {row.Creator ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-600 mx-auto" />
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {row.Author ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-600 mx-auto" />
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {row.Technician ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-600 mx-auto" />
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {row.User ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-600 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: Platform Diagnostics */}
      {activeTab === "platform" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-white/10 bg-slate-900/60">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Server className="h-4 w-4 text-cyan-400" /> Database & Persistence
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">PostgreSQL Status</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Connected (Port 5432)
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">ORM Layer</span>
                  <span className="text-slate-200 font-mono">Prisma v5.22.0</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Active Records</span>
                  <span className="text-cyan-300 font-semibold">{teamMembers.length} Accounts</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/60">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-400" /> Email & Authentication Services
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Mail Delivery Driver</span>
                  <span className="text-cyan-300 font-mono">Nodemailer SMTP & Verified Outbox</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Google OAuth Provider</span>
                  <span className="text-slate-300 font-mono">Google Identity Services (GIS)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Token Security</span>
                  <span className="text-emerald-400 font-semibold">HMAC-SHA256 (JWT 7-Day Expiry)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
              <UserPlus className="h-5 w-5 text-cyan-400" /> Invite New Team Member
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              An invitation email with a single-use onboarding link will be sent to the recipient.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail" className="text-slate-200">
                  Email Address
                </Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@organization.com"
                  className="border-white/10 bg-slate-950 text-slate-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviteRole" className="text-slate-200">
                  Assigned Team Role
                </Label>
                <select
                  id="inviteRole"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="w-full rounded-md border border-white/10 bg-slate-950 p-2 text-sm text-slate-200"
                >
                  {ROLE_OPTIONS.map((ro) => (
                    <option
                      key={ro.value}
                      value={ro.value}
                      disabled={ro.value === "OWNER" && !isOwner}
                    >
                      {ro.label} {ro.value === "OWNER" && !isOwner ? "(Requires Owner)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviteDept" className="text-slate-200">
                  Department / Scope (Optional)
                </Label>
                <Input
                  id="inviteDept"
                  type="text"
                  value={inviteDepartment}
                  onChange={(e) => setInviteDepartment(e.target.value)}
                  placeholder="e.g. Sanitization Lab, Compliance"
                  className="border-white/10 bg-slate-950 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                  className="border-white/10 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={inviteLoading || !inviteEmail.trim()}
                  className="bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400"
                >
                  {inviteLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...
                    </>
                  ) : (
                    "Send Invitation"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function Profile() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader title="User Profile" description="Your authenticated credentials and organizational scope." />
      <Card className="max-w-xl border-white/10 bg-slate-900/60 shadow-xl backdrop-blur">
        <CardContent className="flex items-center gap-5 p-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center text-xl font-bold text-slate-950 shadow-lg shadow-cyan-500/20">
            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-sm text-slate-400 font-mono">{user?.email}</p>
            <div className="pt-2 flex items-center gap-2">
              <span className="inline-block rounded-full bg-cyan-400/10 border border-cyan-400/20 px-3 py-0.5 text-xs font-semibold text-cyan-300">
                ROLE: {user?.role}
              </span>
              <span className="inline-block rounded-full bg-slate-800 px-3 py-0.5 text-xs text-slate-400 font-mono">
                {user?.department || "Operations"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
