import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCardLayout } from "@/components/auth-layout";
import { api } from "@/lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const token = searchParams.get("token");

  const [email, setEmail] = useState(emailParam);
  const [tokenVal, setTokenVal] = useState(token || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!tokenVal) {
      setError("Password reset token is required. Please provide the token from your reset email.");
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
      const res = await api.auth.resetPassword({
        token: tokenVal,
        email: email || undefined,
        newPassword: password,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(res.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout
      icon={Lock}
      title="New password"
      subtitle="Enter your new password below"
      footer={
        <Link
          to="/login"
          className="inline-flex items-center text-cyan-400 font-medium hover:underline hover:text-cyan-300"
        >
          <ArrowLeft className="w-3 h-3 mr-1" /> Back to log in
        </Link>
      }
    >
      {success ? (
        <div className="py-6 text-center space-y-3">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 animate-bounce" />
          <p className="text-lg font-semibold text-white">Password Updated!</p>
          <p className="text-sm text-slate-400">
            Your password has been changed successfully. Redirecting you to login...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {!emailParam && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Account Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-white/10 bg-slate-950/60 text-slate-200 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                required
              />
            </div>
          )}

          {!token && (
            <div className="space-y-2">
              <Label htmlFor="token" className="text-slate-200">
                Reset Security Token
              </Label>
              <Input
                id="token"
                type="text"
                placeholder="Paste token from reset email"
                value={tokenVal}
                onChange={(e) => setTokenVal(e.target.value)}
                className="h-12 border-white/10 bg-slate-950/60 text-slate-200 placeholder:text-slate-500 font-mono text-xs focus-visible:ring-cyan-500"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                autoFocus
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 border-white/10 bg-slate-950/60 text-slate-200 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-slate-200">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="confirm"
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
                Resetting password...
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      )}
    </AuthCardLayout>
  );
}
