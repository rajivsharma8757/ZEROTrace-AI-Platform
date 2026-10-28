import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { UserPlus, Mail, Lock, User, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCardLayout, GoogleIcon } from "@/components/auth-layout";
import { api, setToken } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function Register() {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/portal";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.auth.register({
        fullName,
        email,
        password,
        department: department || "Client Services",
      });

      if (res.success && res.token) {
        setToken(res.token);
        setRegistered(true);
        // Automatically sync login
        await login(email, password);
        setTimeout(() => {
          navigate(returnTo && returnTo !== "/" ? returnTo : "/portal", { replace: true });
        }, 1500);
      } else {
        setError(res.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up for ZEROTrace AI"
      footer={
        <p>
          Already have an account?{" "}
          <Link
            to={`/login${returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
            className="text-cyan-400 font-medium hover:underline hover:text-cyan-300"
          >
            Log in
          </Link>
        </p>
      }
    >
      {registered ? (
        <div className="py-6 text-center space-y-3">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 animate-bounce" />
          <h3 className="text-lg font-semibold text-white">Account Created!</h3>
          <p className="text-sm text-slate-300">
            A verification email has been dispatched to <span className="text-cyan-300 font-mono">{email}</span>.
          </p>
          <p className="text-xs text-slate-400">Directing you to your portal...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-slate-200">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                autoFocus
                placeholder="Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 h-12 border-white/10 bg-slate-950/60 text-slate-200 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 border-white/10 bg-slate-950/60 text-slate-200 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-slate-200">
              Department / Organization (Optional)
            </Label>
            <Input
              id="department"
              type="text"
              placeholder="e.g. IT Operations, Compliance, Logistics"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-12 border-white/10 bg-slate-950/60 text-slate-200 placeholder:text-slate-500 focus-visible:ring-cyan-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 border-white/10 bg-slate-950/60 text-slate-200 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-200">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 h-12 border-white/10 bg-slate-950/60 text-slate-200 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 font-medium bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      )}
    </AuthCardLayout>
  );
}
