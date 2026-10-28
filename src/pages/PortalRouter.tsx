import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function rolePortalPath(role?: string): string {
  const r = (role || "").toUpperCase();
  if (r === "OWNER" || r === "ADMIN" || r === "ADMINISTRATOR" || r === "AUDITOR") return "/admin";
  if (r === "OPERATOR" || r === "EMPLOYEE" || r === "TECHNICIAN" || r === "CREATOR" || r === "AUTHOR") return "/employee";
  if (r === "CUSTOMER" || r === "USER") return "/customer";
  return "/customer";
}

export default function PortalRouter() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login?returnTo=/portal", { replace: true });
      return;
    }

    try {
      const destination = rolePortalPath(user.role);
      navigate(destination, { replace: true });
    } catch (err: any) {
      setError(err?.message || "Unable to route to role portal.");
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        <p className="text-sm font-medium">Routing to your portal…</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
