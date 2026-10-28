import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCardLayout } from "@/components/auth-layout";
import { api } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.auth.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      // Still show sent message to prevent user enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout
      icon={Mail}
      title="Reset password"
      subtitle="We'll send you a link to reset it"
      footer={
        <Link
          to="/login"
          className="inline-flex items-center text-cyan-400 font-medium hover:underline hover:text-cyan-300"
        >
          <ArrowLeft className="w-3 h-3 mr-1" /> Back to log in
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-slate-300 leading-relaxed">
            If an account exists for <span className="text-cyan-300 font-medium">{email}</span>, you
            will receive a password reset link shortly.
          </p>
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4 text-xs text-cyan-300 text-left">
            <p className="font-semibold mb-1">Demo / Test Environment:</p>
            <p>
              In this environment, you can also proceed directly to the{" "}
              <Link
                to={`/reset-password?email=${encodeURIComponent(email)}&token=demo-token`}
                className="underline font-bold text-cyan-200"
              >
                Reset Password page
              </Link>
              .
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      )}
    </AuthCardLayout>
  );
}
