import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface AuthCardLayoutProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function GoogleIcon({ className = "w-5 h-5 mr-2" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthCardLayout({ icon: Icon, title, subtitle, footer, children }: AuthCardLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500 mb-4 shadow-lg shadow-cyan-500/20">
            <Icon className="w-7 h-7 text-slate-950" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
          {subtitle && <p className="text-slate-400 mt-2 text-sm">{subtitle}</p>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
          {children}
        </div>

        {footer && <div className="text-center text-sm text-slate-400 mt-6">{footer}</div>}
      </div>
    </div>
  );
}
