import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useAppData } from "@/hooks/use-app-data";
import { api } from "@/lib/api";
import { OwnerDashboard } from "@/components/dashboards/OwnerDashboard";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { AuditorDashboard } from "@/components/dashboards/AuditorDashboard";
import { TechnicianDashboard } from "@/components/dashboards/TechnicianDashboard";
import { CustomerDashboard } from "@/components/dashboards/CustomerDashboard";

export default function Dashboard() {
  const { data, refresh } = useAppData();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [sRes, cRes] = await Promise.allSettled([
          api.dashboard.getStats(),
          api.dashboard.getCharts(),
        ]);
        if (sRes.status === "fulfilled" && sRes.value.success) {
          setStats(sRes.value.data);
        }
        if (cRes.status === "fulfilled" && cRes.value.success) {
          setCharts(cRes.value.data);
        }
      } catch (err) {
        console.warn("Failed to fetch dashboard stats from API:", err);
      }
    }
    fetchStats();
  }, [data]);

  if (!user) return null;

  const role = user.role?.toUpperCase() || "USER";
  const userEmail = (user.email || "").toLowerCase();

  const isOwner = role === "OWNER" || userEmail === "rajivkumarsharma200@gmail.com";
  const isAdmin = role === "ADMIN" || role === "ADMINISTRATOR";
  const isAuditor = role === "AUDITOR";
  const isTechnician = role === "OPERATOR" || role === "TECHNICIAN" || role === "EMPLOYEE";

  if (isOwner) {
    return <OwnerDashboard data={data} stats={stats} user={user} onRefresh={refresh} />;
  }

  if (isAdmin) {
    return <AdminDashboard data={data} stats={stats} user={user} onRefresh={refresh} />;
  }

  if (isAuditor) {
    return <AuditorDashboard data={data} stats={stats} user={user} onRefresh={refresh} />;
  }

  if (isTechnician) {
    return <TechnicianDashboard data={data} stats={stats} user={user} onRefresh={refresh} />;
  }

  // Default to Customer / User view
  return <CustomerDashboard data={data} stats={stats} user={user} onRefresh={refresh} />;
}
