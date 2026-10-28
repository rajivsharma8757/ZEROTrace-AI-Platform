import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { audit, getData, saveData } from "./data";
import type { User } from "./models";

type AuthValue = { user: User | null; login: (email: string) => boolean; logout: () => void };
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { const id = localStorage.getItem("zerotrace-user"); if (id) setUser(getData().users.find((x) => x.id === id) ?? null); }, []);
  const login = (email: string) => { const data = getData(); const found = data.users.find((x) => x.email === email); if (!found) return false; localStorage.setItem("zerotrace-user", found.id); audit(data, found.id, "LOGIN", "User", found.id, "Demo user signed in"); saveData(data); setUser(found); return true; };
  const logout = () => { if (user) { const data = getData(); audit(data, user.id, "LOGOUT", "User", user.id, "Demo user signed out"); saveData(data); } localStorage.removeItem("zerotrace-user"); setUser(null); };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => { const value = useContext(AuthContext); if (!value) throw new Error("AuthProvider missing"); return value; };
