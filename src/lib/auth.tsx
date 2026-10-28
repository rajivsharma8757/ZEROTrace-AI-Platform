import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, setToken } from "./api";
import type { Role, User } from "./models";

type AuthValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginWithGoogleToken: (credential: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRoleDemo?: (role: Role) => Promise<boolean>;
};

const AuthContext = createContext<AuthValue | null>(null);

const DEMO_PASSWORDS: Record<string, string> = {
  "admin@zerotrace.demo": "Admin@12345",
  "operator@zerotrace.demo": "Operator@12345",
  "auditor@zerotrace.demo": "Auditor@12345",
  "customer@zerotrace.demo": "Customer@12345",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session via verified backend token on mount
  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem("zerotrace_jwt_token");
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.user) {
            setUser({
              id: res.user.id,
              name: res.user.fullName || res.user.name || res.user.email,
              fullName: res.user.fullName,
              email: res.user.email,
              role: res.user.role as Role,
              organizationId: res.user.organization?.id || res.user.organizationId || "org-apex-01",
              department: res.user.department,
              status: res.user.status,
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          // Token invalid or expired: clear local token
          setToken(null);
          localStorage.removeItem("zerotrace-user-cache");
          setUser(null);
        }
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setLoading(true);

    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.token && res.user) {
        setToken(res.token);
        const mappedUser: User = {
          id: res.user.id,
          name: res.user.fullName || res.user.name || res.user.email,
          fullName: res.user.fullName,
          email: res.user.email,
          role: res.user.role as Role,
          organizationId: res.user.organizationId || "org-apex-01",
          department: res.user.department,
          status: res.user.status,
        };
        setUser(mappedUser);
        localStorage.setItem("zerotrace-user-cache", JSON.stringify(mappedUser));
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (err: any) {
      setLoading(false);
      // Propagate actual backend error to UI
      throw err;
    }
  };

  const loginWithGoogleToken = async (credential: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await api.auth.googleAuth(credential);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        const mappedUser: User = {
          id: res.user.id,
          name: res.user.fullName || res.user.name || res.user.email,
          fullName: res.user.fullName,
          email: res.user.email,
          role: res.user.role as Role,
          organizationId: res.user.organizationId || "org-apex-01",
          department: res.user.department,
          status: res.user.status,
        };
        setUser(mappedUser);
        localStorage.setItem("zerotrace-user-cache", JSON.stringify(mappedUser));
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {}
    setToken(null);
    localStorage.removeItem("zerotrace-user-cache");
    setUser(null);
  };

  const switchRoleDemo = async (role: Role) => {
    const roleEmailMap: Record<string, string> = {
      OWNER: "admin@zerotrace.demo",
      ADMINISTRATOR: "admin@zerotrace.demo",
      ADMIN: "admin@zerotrace.demo",
      OPERATOR: "operator@zerotrace.demo",
      TECHNICIAN: "operator@zerotrace.demo",
      AUDITOR: "auditor@zerotrace.demo",
      CUSTOMER: "customer@zerotrace.demo",
      USER: "customer@zerotrace.demo",
      EMPLOYEE: "operator@zerotrace.demo",
      CREATOR: "customer@zerotrace.demo",
      AUTHOR: "customer@zerotrace.demo",
    };
    const targetEmail = roleEmailMap[role] || "admin@zerotrace.demo";
    return login(targetEmail, DEMO_PASSWORDS[targetEmail] || "Admin@12345");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogleToken, logout, switchRoleDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider missing");
  return value;
};
