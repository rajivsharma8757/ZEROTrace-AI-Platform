import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { AppShell, homeFor } from "./components/app-shell";
import { AuthProvider, useAuth } from "./lib/auth";
import type { Role } from "./lib/models";
import AuditLog from "./pages/AuditLog";
import Certificates from "./pages/Certificates";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PublicVerify from "./pages/PublicVerify";
import Recycling from "./pages/Recycling";
import { Profile, Settings } from "./pages/SettingsProfile";
import Verification from "./pages/Verification";
import WipeJobs from "./pages/WipeJobs";

const queryClient = new QueryClient();
function Protected({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return <AppShell>{children}</AppShell>;
}
const App = () => <QueryClientProvider client={queryClient}><TooltipProvider><Toaster /><Sonner /><AuthProvider><BrowserRouter><Routes>
  <Route path="/" element={<Navigate to="/login" replace />} />
  <Route path="/login" element={<Login />} />
  <Route path="/admin-dashboard" element={<Protected roles={["ADMIN"]}><Dashboard /></Protected>} />
  <Route path="/employee-dashboard" element={<Protected roles={["EMPLOYEE"]}><Dashboard /></Protected>} />
  <Route path="/customer-dashboard" element={<Protected roles={["CUSTOMER"]}><Dashboard /></Protected>} />
  <Route path="/devices" element={<Protected><Devices /></Protected>} />
  <Route path="/wipe-jobs" element={<Protected roles={["ADMIN", "EMPLOYEE"]}><WipeJobs /></Protected>} />
  <Route path="/verification" element={<Protected><Verification /></Protected>} />
  <Route path="/certificates" element={<Protected><Certificates /></Protected>} />
  <Route path="/audit-log" element={<Protected roles={["ADMIN"]}><AuditLog /></Protected>} />
  <Route path="/recycling" element={<Protected roles={["ADMIN", "EMPLOYEE"]}><Recycling /></Protected>} />
  <Route path="/settings" element={<Protected roles={["ADMIN"]}><Settings /></Protected>} />
  <Route path="/profile" element={<Protected><Profile /></Protected>} />
  <Route path="/verify/:certificateId" element={<PublicVerify />} />
  <Route path="*" element={<NotFound />} />
</Routes></BrowserRouter></AuthProvider></TooltipProvider></QueryClientProvider>;
export default App;
