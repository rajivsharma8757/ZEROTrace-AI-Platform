import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { AppShell, homeFor } from "./components/app-shell";
import { AuthProvider, useAuth } from "./lib/auth";
import type { Role } from "./lib/models";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AcceptInvitation from "./pages/AcceptInvitation";
import PortalRouter from "./pages/PortalRouter";
import VerifyCertificate from "./pages/VerifyCertificate";

import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import WipeJobs from "./pages/WipeJobs";
import Verification from "./pages/Verification";
import Certificates from "./pages/Certificates";
import AuditLog from "./pages/AuditLog";
import Recycling from "./pages/Recycling";
import Reports from "./pages/Reports";
import UsersPage from "./pages/Users";
import Notifications from "./pages/Notifications";
import { Profile, Settings } from "./pages/SettingsProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function Protected({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-300">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent mx-auto mb-3" />
          <p className="text-xs font-mono">Restoring ZEROTrace Session...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login?returnTo=/portal" replace />;
  if (roles) {
    const userRole = (user.role || "").toUpperCase();
    const isOwner = userRole === "OWNER";
    const allowed = roles.map((r) => r.toUpperCase());
    const matches =
      isOwner ||
      allowed.includes(userRole) ||
      (userRole === "ADMINISTRATOR" && allowed.includes("ADMIN")) ||
      (userRole === "ADMIN" && allowed.includes("ADMINISTRATOR")) ||
      (userRole === "TECHNICIAN" && (allowed.includes("OPERATOR") || allowed.includes("EMPLOYEE"))) ||
      (userRole === "OPERATOR" && (allowed.includes("TECHNICIAN") || allowed.includes("EMPLOYEE"))) ||
      (userRole === "USER" && allowed.includes("CUSTOMER")) ||
      (userRole === "CUSTOMER" && allowed.includes("USER"));

    if (!matches) return <Navigate to={homeFor(user.role)} replace />;
  }
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              {/* Public Landing & Marketing */}
              <Route path="/" element={<LandingPage />} />

              {/* Public Certificate Verification Gateway */}
              <Route path="/verify" element={<VerifyCertificate />} />
              <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
              <Route path="/certificate/:id" element={<VerifyCertificate />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/accept-invitation" element={<AcceptInvitation />} />

              {/* Role Dispatch Gateway */}
              <Route
                path="/portal"
                element={
                  <Protected>
                    <PortalRouter />
                  </Protected>
                }
              />

              {/* ============================================================== */}
              {/* EXACT VIDEO-MATCHED ROLE PORTAL ROUTES                         */}
              {/* ============================================================== */}

              {/* Administrator & Auditor Portal Routes */}
              <Route
                path="/admin"
                element={
                  <Protected roles={["ADMIN", "AUDITOR"]}>
                    <Dashboard />
                  </Protected>
                }
              />
              <Route
                path="/admin/assets"
                element={
                  <Protected roles={["ADMIN", "AUDITOR"]}>
                    <Devices />
                  </Protected>
                }
              />
              <Route
                path="/admin/jobs"
                element={
                  <Protected roles={["ADMIN"]}>
                    <WipeJobs />
                  </Protected>
                }
              />
              <Route
                path="/admin/certificates"
                element={
                  <Protected roles={["ADMIN"]}>
                    <Certificates />
                  </Protected>
                }
              />
              <Route
                path="/admin/recycling"
                element={
                  <Protected roles={["ADMIN", "AUDITOR"]}>
                    <Recycling />
                  </Protected>
                }
              />
              <Route
                path="/admin/audit"
                element={
                  <Protected roles={["ADMIN", "AUDITOR"]}>
                    <AuditLog />
                  </Protected>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <Protected roles={["ADMIN", "AUDITOR"]}>
                    <Reports />
                  </Protected>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <Protected roles={["ADMIN"]}>
                    <UsersPage />
                  </Protected>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <Protected roles={["ADMIN"]}>
                    <Settings />
                  </Protected>
                }
              />

              {/* Operator / Technician / Employee Portal Routes */}
              <Route
                path="/employee"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <Dashboard />
                  </Protected>
                }
              />
              <Route
                path="/technician"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <Dashboard />
                  </Protected>
                }
              />
              <Route
                path="/technician/dashboard"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <Dashboard />
                  </Protected>
                }
              />
              <Route
                path="/technician/register"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <Devices />
                  </Protected>
                }
              />
              <Route
                path="/technician/assets"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <Devices />
                  </Protected>
                }
              />
              <Route
                path="/technician/device/:id"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <Devices />
                  </Protected>
                }
              />
              <Route
                path="/technician/jobs"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <WipeJobs />
                  </Protected>
                }
              />
              <Route
                path="/technician/wipe/:jobId"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <WipeJobs />
                  </Protected>
                }
              />
              <Route
                path="/technician/certificates"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <Certificates />
                  </Protected>
                }
              />
              <Route
                path="/technician/certificate/:id"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <Certificates />
                  </Protected>
                }
              />
              <Route
                path="/technician/recycling"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <Recycling />
                  </Protected>
                }
              />
              <Route
                path="/technician/audit"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <AuditLog />
                  </Protected>
                }
              />
              <Route
                path="/employee/register"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <Devices />
                  </Protected>
                }
              />
              <Route
                path="/employee/assets"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <Devices />
                  </Protected>
                }
              />
              <Route
                path="/employee/device/:id"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <Devices />
                  </Protected>
                }
              />
              <Route
                path="/employee/jobs"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <WipeJobs />
                  </Protected>
                }
              />
              <Route
                path="/employee/wipe/:jobId"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <WipeJobs />
                  </Protected>
                }
              />
              <Route
                path="/employee/certificates"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <Certificates />
                  </Protected>
                }
              />
              <Route
                path="/employee/certificate/:id"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <Certificates />
                  </Protected>
                }
              />
              <Route
                path="/employee/recycling"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <Recycling />
                  </Protected>
                }
              />
              <Route
                path="/employee/audit"
                element={
                  <Protected roles={["TECHNICIAN", "OPERATOR", "EMPLOYEE", "ADMIN"]}>
                    <AuditLog />
                  </Protected>
                }
              />

              {/* Customer Portal Routes */}
              <Route
                path="/customer"
                element={
                  <Protected roles={["CUSTOMER", "ADMIN"]}>
                    <Devices />
                  </Protected>
                }
              />
              <Route
                path="/customer/certificates"
                element={
                  <Protected roles={["CUSTOMER", "ADMIN"]}>
                    <Certificates />
                  </Protected>
                }
              />
              <Route
                path="/customer/certificate/:id"
                element={
                  <Protected roles={["CUSTOMER", "ADMIN"]}>
                    <VerifyCertificate />
                  </Protected>
                }
              />

              {/* ============================================================== */}
              {/* LEGACY COMPATIBILITY ROUTE ALIASES                             */}
              {/* ============================================================== */}
              <Route
                path="/admin-dashboard"
                element={
                  <Protected roles={["ADMIN"]}>
                    <Dashboard />
                  </Protected>
                }
              />
              <Route
                path="/employee-dashboard"
                element={
                  <Protected roles={["OPERATOR", "EMPLOYEE", "TECHNICIAN"]}>
                    <Dashboard />
                  </Protected>
                }
              />
              <Route
                path="/technician-dashboard"
                element={
                  <Protected roles={["OPERATOR", "EMPLOYEE", "TECHNICIAN"]}>
                    <Dashboard />
                  </Protected>
                }
              />
              <Route
                path="/auditor-dashboard"
                element={
                  <Protected roles={["AUDITOR"]}>
                    <Dashboard />
                  </Protected>
                }
              />
              <Route
                path="/customer-dashboard"
                element={
                  <Protected roles={["CUSTOMER", "USER"]}>
                    <Dashboard />
                  </Protected>
                }
              />
              <Route
                path="/devices"
                element={
                  <Protected>
                    <Devices />
                  </Protected>
                }
              />
              <Route
                path="/wipe-jobs"
                element={
                  <Protected roles={["ADMIN", "OPERATOR", "EMPLOYEE", "TECHNICIAN"]}>
                    <WipeJobs />
                  </Protected>
                }
              />
              <Route
                path="/verification"
                element={
                  <Protected>
                    <Verification />
                  </Protected>
                }
              />
              <Route
                path="/certificates"
                element={
                  <Protected>
                    <Certificates />
                  </Protected>
                }
              />
              <Route
                path="/audit-log"
                element={
                  <Protected roles={["ADMIN", "AUDITOR"]}>
                    <AuditLog />
                  </Protected>
                }
              />
              <Route
                path="/recycling"
                element={
                  <Protected roles={["ADMIN", "OPERATOR", "EMPLOYEE", "AUDITOR", "TECHNICIAN"]}>
                    <Recycling />
                  </Protected>
                }
              />
              <Route
                path="/reports"
                element={
                  <Protected roles={["ADMIN", "OPERATOR", "AUDITOR", "TECHNICIAN"]}>
                    <Reports />
                  </Protected>
                }
              />
              <Route
                path="/users"
                element={
                  <Protected roles={["ADMIN"]}>
                    <UsersPage />
                  </Protected>
                }
              />
              <Route
                path="/notifications"
                element={
                  <Protected>
                    <Notifications />
                  </Protected>
                }
              />
              <Route
                path="/settings"
                element={
                  <Protected roles={["ADMIN"]}>
                    <Settings />
                  </Protected>
                }
              />
              <Route
                path="/profile"
                element={
                  <Protected>
                    <Profile />
                  </Protected>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
