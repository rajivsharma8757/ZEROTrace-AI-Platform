import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ShieldAlert, Loader2, ArrowRight, Mail, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCardLayout } from "@/components/auth-layout";
import { api } from "@/lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [token, setToken] = useState(tokenParam);
  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(Boolean(tokenParam));
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (tokenToUse: string, emailToUse: string) => {
    if (!tokenToUse) {
      setError("Please provide your email verification token.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await api.auth.verifyEmail(tokenToUse, emailToUse);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || "Email verification failed.");
      }
    } catch (err: any) {
      setError(err?.message || "Invalid or expired email verification token.");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (tokenParam) {
      handleVerify(tokenParam, emailParam);
    } else {
      setLoading(false);
    }
  }, [tokenParam, emailParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(token, email);
  };

  return (
    <AuthCardLayout
      icon={CheckCircle2}
      title="Email Verification"
      subtitle="ZEROTrace AI Account Activation"
      footer={
        <Link
          to="/login"
          className="text-cyan-400 font-medium hover:underline hover:text-cyan-300"
        >
          Return to login
        </Link>
      }
    >
      {loading ? (
        <div className="py-8 text-center space-y-3">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-sm text-slate-400">Verifying your email address...</p>
        </div>
      ) : success ? (
        <div className="py-6 text-center space-y-4">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Email Verified Successfully</h3>
          <p className="text-sm text-slate-300">
            Your ZEROTrace AI account is fully verified and ready for use.
          </p>
          <Button
            asChild
            className="w-full bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400 mt-4"
          >
            <Link to="/login">
              Proceed to Login <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Account Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-white/10 bg-slate-950/60 text-slate-200 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token" className="text-slate-200">
                Verification Token
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="token"
                  type="text"
                  placeholder="Paste verification token from email"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="pl-10 h-12 border-white/10 bg-slate-950/60 text-slate-200 placeholder:text-slate-500 font-mono text-xs focus-visible:ring-cyan-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 font-medium bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition mt-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying account...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>
        </div>
      )}
    </AuthCardLayout>
  );
}
