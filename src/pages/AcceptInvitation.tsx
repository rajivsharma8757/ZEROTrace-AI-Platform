import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { UserCheck, Lock, User, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCardLayout } from "@/components/auth-layout";
import { api } from "@/lib/api";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [tokenVal, setTokenVal] = useState(token);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!tokenVal) {
      setError("Missing invitation token. Please check your invitation email or enter the token.");
      return;
    }

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
      const res = await api.users.acceptInvitation({
        token: tokenVal,
        fullName,
        password,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(res.message || "Failed to accept invitation.");
      }
    } catch (err: any) {
      setError(err?.message || "Invalid, expired, or already accepted invitation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout
      icon={UserCheck}
      title="Accept Team Invitation"
      subtitle="Complete your ZEROTrace AI team account setup"
      footer={
        <Link
          to="/login"
          className="text-cyan-400 font-medium hover:underline hover:text-cyan-300"
        >
          Return to login
        </Link>
      }
    >
      {success ? (
        <div className="py-6 text-center space-y-4">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 animate-bounce" />
          <h3 className="text-lg font-semibold text-white">Welcome to the Team!</h3>
          <p className="text-sm text-slate-300">
            Your account has been activated. Redirecting to login...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          {!token && (
            <div className="space-y-2">
              <Label htmlFor="token" className="text-slate-200">
                Invitation Security Token
              </Label>
              <Input
                id="token"
                type="text"
                placeholder="Paste invitation token from email"
                value={tokenVal}
                onChange={(e) => setTokenVal(e.target.value)}
                className="h-12 border-white/10 bg-slate-950/60 text-slate-200 placeholder:text-slate-500 font-mono text-xs focus-visible:ring-cyan-500"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-slate-200">
              Your Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                autoFocus
                placeholder="Jordan Lee"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 h-12 border-white/10 bg-slate-950/60 text-slate-200 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
              Create Password
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
                Activating account...
              </>
            ) : (
              "Activate Account & Join"
            )}
          </Button>
        </form>
      )}
    </AuthCardLayout>
  );
}
