import {
  Users as UsersIcon,
  UserPlus,
  Shield,
  Search,
  CheckCircle2,
  Trash2,
  Lock,
  Loader2,
  Building,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.users.getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.warn("Failed to load users from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (form: HTMLFormElement) => {
    setSubmitting(true);
    const fd = new FormData(form);

    const payload = {
      fullName: String(fd.get("fullName")),
      email: String(fd.get("email")),
      password: String(fd.get("password") || "User@12345"),
      role: String(fd.get("role")),
      department: String(fd.get("department")),
    };

    try {
      const res = await api.users.createUser(payload);
      if (res.success) {
        setShowAddModal(false);
        form.reset();
        await loadUsers();
      }
    } catch (err: any) {
      alert(err?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await api.users.updateUser(id, { status: nextStatus });
      await loadUsers();
    } catch (err: any) {
      alert("Status update failed");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate or remove this user?")) return;
    try {
      await api.users.deleteUser(id);
      await loadUsers();
    } catch (err: any) {
      alert("Failed to delete user");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <>
      <PageHeader
        title="Identity & Access Governance (RBAC)"
        description="Manage enterprise operators, independent compliance auditors, clients, and role-based permissions."
        action={
          <Button
            onClick={() => setShowAddModal(!showAddModal)}
            className="bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {showAddModal ? "Cancel" : "Add Authorized User"}
          </Button>
        }
      />

      {/* Add User Modal */}
      {showAddModal && (
        <Card className="mb-6 border-cyan-400/30 bg-slate-900/90 shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <UserPlus size={18} className="text-cyan-300" /> Provision New Operator / User
            </h2>

            <form
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddUser(e.currentTarget);
              }}
            >
              <div>
                <label className="text-xs text-slate-400">Full Name</label>
                <Input required name="fullName" placeholder="e.g. Elena Rostova" className="mt-1 border-slate-700 bg-slate-950" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Corporate Email</label>
                <Input required type="email" name="email" placeholder="e.g. elena@zerotrace.demo" className="mt-1 border-slate-700 bg-slate-950" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Assigned RBAC Role</label>
                <select name="role" className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                  <option value="OPERATOR">Operator / Sanitization Technician</option>
                  <option value="AUDITOR">Auditor / Compliance Inspector</option>
                  <option value="ADMIN">System Administrator</option>
                  <option value="CUSTOMER">Client / Asset Owner</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400">Department / Unit</label>
                <Input name="department" defaultValue="Sanitization Operations" className="mt-1 border-slate-700 bg-slate-950" />
              </div>

              <div>
                <label className="text-xs text-slate-400">Initial Password</label>
                <Input required type="password" name="password" defaultValue="Operator@12345" className="mt-1 border-slate-700 bg-slate-950" />
              </div>

              <div className="flex items-end gap-2 pt-1">
                <Button type="button" variant="outline" className="border-slate-700" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Provision"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter and Search */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email, department..."
            className="pl-9 border-slate-800 bg-slate-900/80 text-sm text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "ADMIN", "OPERATOR", "AUDITOR", "CUSTOMER"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                roleFilter === r
                  ? "bg-cyan-400 text-slate-950 shadow"
                  : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">User / Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Department</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.map((u) => {
                const isActive = u.status === "ACTIVE";
                const isCurrent = u.id === user?.id;

                return (
                  <tr className="hover:bg-slate-800/30 transition" key={u.id}>
                    <td className="p-4">
                      <div className="font-semibold text-white">{u.fullName || u.name}</div>
                      <span className="text-[11px] text-slate-400">{u.email}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-semibold rounded bg-slate-800 px-2 py-0.5 text-cyan-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{u.department || "Enterprise IT"}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isActive
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                            : "bg-rose-950/60 text-rose-400 border border-rose-800/60"
                        }`}
                      >
                        {isActive ? "ACTIVE" : "SUSPENDED"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Permanent"}
                    </td>
                    <td className="p-4 text-right">
                      {!isCurrent && (
                        <div className="inline-flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            className="text-xs text-slate-400 hover:text-white"
                          >
                            {isActive ? "Suspend" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-slate-400">
                    No users match the specified criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}
