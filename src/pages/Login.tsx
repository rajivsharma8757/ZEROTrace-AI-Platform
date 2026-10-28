import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LogIn, Mail, Lock, Loader2, Sparkles, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCardLayout, GoogleIcon } from "@/components/auth-layout";
import { useAuth } from "@/lib/auth";

declare global {
  interface Window {
    google?: any;
  }
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/portal";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDemoRoles, setShowDemoRoles] = useState(false);

  const googleBtnRef = useRef<HTMLDivElement>(null);
  const { login, loginWithGoogleToken } = useAuth();
  const navigate = useNavigate();

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  // Load Google Identity Services script if configured
  useEffect(() => {
    if (!googleClientId) return;

    const setupGsi = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              setLoading(true);
              setError("");
              try {
                const ok = await loginWithGoogleToken(response.credential);
                if (ok) {
                  navigate(returnTo && returnTo !== "/" ? returnTo : "/portal", { replace: true });
                }
              } catch (err: any) {
                setError(err?.message || "Google sign-in could not be completed.");
              } finally {
                setLoading(false);
              }
            }
          },
        });

        if (googleBtnRef.current) {
          try {
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              theme: "outline",
              size: "large",
              width: 360,
              text: "continue_with",
              shape: "rectangular",
            });
          } catch (e) {
            console.warn("Could not render official Google button:", e);
          }
        }
      }
    };

    if (!document.getElementById("google-gsi-client")) {
      const script = document.createElement("script");
      script.id = "google-gsi-client";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = setupGsi;
      document.body.appendChild(script);
    } else {
      setupGsi();
    }
  }, [googleClientId, loginWithGoogleToken, navigate, returnTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);

    try {
      const ok = await login(email, password);
      if (ok) {
        if (returnTo && returnTo !== "/" && returnTo !== "/login") {
          navigate(returnTo, { replace: true });
        } else {
          navigate("/portal", { replace: true });
        }
      } else {
        setError("Invalid email or password.");
      }
    } catch (err: any) {
      setError(err?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError("");
    setInfoMessage("");

    if (!googleClientId) {
      setError(
        "Google Sign-In is not configured yet. Please configure VITE_GOOGLE_CLIENT_ID in your root .env file and GOOGLE_CLIENT_ID on the backend. Refer to docs/GOOGLE_AUTH_SETUP.md for Google Cloud Console setup instructions."
      );
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If prompt fails or is blocked by third party cookies, inform user
          setInfoMessage("Please check your browser popup/cookie settings to complete Google sign-in.");
        }
      });
    } else {
      setError("Google Identity Services is currently loading. Please try again in a moment.");
    }
  };

  const handleQuickRole = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
    setInfoMessage("");
    setLoading(true);
    try {
      const ok = await login(demoEmail, demoPass);
      if (ok) {
        navigate("/portal", { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || "Quick demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <div className="space-y-4">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              to={`/register${returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
              className="text-cyan-400 font-medium hover:underline hover:text-cyan-300"
            >
              Create one
            </Link>
          </p>

          {/* Quick Demo Access Switcher for SIH Evaluators */}
          <div className="pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowDemoRoles((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition"
            >
              <Sparkles className="h-3 w-3" />
              <span>SIH Offline Evaluation Accounts</span>
            </button>

            {showDemoRoles && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-left">
                {[
                  { label: "Administrator", email: "admin@zerotrace.demo", pass: "Admin@12345" },
                  { label: "Technician", email: "operator@zerotrace.demo", pass: "Operator@12345" },
                  { label: "Auditor", email: "auditor@zerotrace.demo", pass: "Auditor@12345" },
                  { label: "Normal User", email: "customer@zerotrace.demo", pass: "Customer@12345" },
                ].map((demo) => (
                  <button
                    key={demo.label}
                    type="button"
                    onClick={() => handleQuickRole(demo.email, demo.pass)}
                    className="rounded-lg border border-white/10 bg-slate-900/60 p-2 text-xs hover:border-cyan-500/40 hover:bg-cyan-500/5 transition text-left"
                  >
                    <p className="font-semibold text-cyan-300">{demo.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{demo.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      }
    >
      {googleClientId ? (
        <div className="mb-6 flex justify-center w-full">
          <div ref={googleBtnRef} className="w-full flex justify-center" />
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 text-sm font-medium mb-6 border-white/10 bg-slate-900 hover:bg-slate-800 hover:text-white text-slate-200"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleIcon className="w-5 h-5 mr-2" />
          Continue with Google
        </Button>
      )}

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-3 text-slate-500 font-mono">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="mb-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{infoMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-200">
            Email
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-slate-200">
              Password
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs text-cyan-400 hover:underline hover:text-cyan-300"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthCardLayout>
  );
}
