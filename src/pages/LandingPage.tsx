import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  AlertTriangle,
  FileCheck2,
  QrCode,
  ClipboardList,
  FileSpreadsheet,
  Leaf,
  Users,
  Network,
  Award,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Recommendation",
    desc: "Intelligent wipe-method selection based on device profile.",
  },
  {
    icon: Lock,
    title: "Secure Wipe Workflow",
    desc: "Structured sanitization pipeline with stage tracking.",
  },
  {
    icon: CheckCircle2,
    title: "Verification",
    desc: "Residual-data verification confirms sanitization success.",
  },
  {
    icon: FileCheck2,
    title: "Digital Certificate",
    desc: "Tamper-proof erasure certificates with cryptographic hash.",
  },
  {
    icon: QrCode,
    title: "QR Verification",
    desc: "Instant public verification via scannable QR codes.",
  },
  {
    icon: ClipboardList,
    title: "Audit Trail",
    desc: "Hash-chained, tamper-evident immutable event ledger.",
  },
  {
    icon: FileSpreadsheet,
    title: "Reports",
    desc: "Compliance, asset, and wipe reporting with PDF/CSV export.",
  },
  {
    icon: Leaf,
    title: "Recycling Approval",
    desc: "Auditor-gated approval before responsible recycling.",
  },
];

const steps = [
  { n: 1, title: "Register Device", desc: "Capture full asset metadata and customer ownership." },
  { n: 2, title: "AI Analysis", desc: "Engine recommends optimal sanitization method." },
  { n: 3, title: "Secure Wipe", desc: "Simulated sanitization with live stage progress." },
  { n: 4, title: "Verification", desc: "Residual-data scan confirms the wipe." },
  { n: 5, title: "Certificate", desc: "Auto-generated digital erasure certificate + QR." },
  { n: 6, title: "Recycle", desc: "Auditor approves responsible recycling." },
];

const values = [
  { icon: Lock, title: "Data Security" },
  { icon: ShieldCheck, title: "Accountability" },
  { icon: Network, title: "Traceability" },
  { icon: Award, title: "Compliance" },
  { icon: Leaf, title: "Recycling Confidence" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-500 shadow-md shadow-cyan-500/20">
              <ShieldCheck className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-white">ZeroTrace AI</p>
              <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-mono">
                Secure. Verify. Prove. Recycle.
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <a href="#problem" className="hover:text-slate-200 transition">
              Problem
            </a>
            <a href="#solution" className="hover:text-slate-200 transition">
              Solution
            </a>
            <a href="#features" className="hover:text-slate-200 transition">
              Features
            </a>
            <a href="#how" className="hover:text-slate-200 transition">
              How It Works
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/verify"
              className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white transition"
            >
              Verify Certificate
            </Link>
            <Link
              to="/login?returnTo=/portal"
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Glow & grid backgrounds */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(34,211,238,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            {/* SIH Tag */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-cyan-300 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              SIH25070 · Secure Data Wiping for IT Asset Recycling
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl text-white">
              Secure IT asset sanitization with{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                verifiable proof
              </span>{" "}
              before responsible recycling.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
              ZeroTrace AI delivers trustworthy data-wiping with AI-recommended methods, verification,
              digital certificates, QR verification, and a tamper-evident audit trail.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/register?returnTo=/portal"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-3 text-sm font-medium text-slate-950 hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/verify"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-medium text-slate-200 hover:bg-white/5 transition"
              >
                <QrCode className="h-4 w-4 text-cyan-400" /> Verify Certificate
              </Link>
              <Link
                to="/login?returnTo=/portal"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-medium text-slate-200 hover:bg-white/5 transition"
              >
                Login
              </Link>
            </div>
          </div>

          {/* 3 Metric Highlight Cards */}
          <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-3">
            {[
              { icon: Lock, label: "Tamper-Evident Ledger", val: "Hash-Chained" },
              { icon: CheckCircle2, label: "Verification Confidence", val: "Up to 99%" },
              { icon: Cpu, label: "AI Method Selection", val: "Real-time" },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur shadow-sm"
              >
                <m.icon className="h-6 w-6 text-cyan-400" />
                <p className="mt-3 text-lg font-semibold text-white">{m.val}</p>
                <p className="text-sm text-slate-400">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                The Problem
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                Deleting is not proving.
              </h2>
              <p className="mt-4 text-slate-400 leading-relaxed">
                Formatting or deleting retired devices does not provide trustworthy proof that sensitive
                information has been properly sanitized. Organizations cannot demonstrate compliance,
                and customers cannot trust that their data is gone — putting security, accountability,
                and recycling at risk.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "No verifiable proof of sanitization",
                  "No accountability or traceability",
                  "Compliance gaps and audit risk",
                  "No customer-facing trust",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Unverified Disposal</span>
              </div>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                &ldquo;We formatted the drive.&rdquo; — but where is the proof? Who did it? When? Was it
                verified? ZeroTrace AI answers all of it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section id="solution" className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
            The Solution
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            A complete, provable pipeline.
          </h2>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
            {["Device", "Sanitization", "Verification", "Certificate", "Audit", "Recycling"].map(
              (step, i, arr) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="rounded-lg border border-white/10 bg-slate-900/60 px-4 py-2 text-slate-200">
                    {step}
                  </span>
                  {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-cyan-400" />}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Features</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Everything needed to secure, verify, and prove.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="rounded-xl border border-white/10 bg-slate-900/60 p-5 transition hover:border-cyan-500/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                  <feat.icon className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="mt-4 font-medium text-white">{feat.title}</h3>
                <p className="mt-1 text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              How It Works
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Six steps from device to certified recycling.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {steps.map((st) => (
              <div
                key={st.n}
                className="rounded-xl border border-white/10 bg-slate-900/60 p-5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-sm font-bold text-slate-950">
                  {st.n}
                </div>
                <h3 className="mt-3 text-sm font-medium text-white">{st.title}</h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {values.map((val) => (
              <div
                key={val.title}
                className="rounded-xl border border-white/10 bg-slate-900/60 p-5 text-center"
              >
                <val.icon className="mx-auto h-6 w-6 text-cyan-400" />
                <p className="mt-3 text-sm font-medium text-white">{val.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready CTA Section */}
      <section className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Ready to prove your data is gone?
          </h2>
          <p className="mt-3 text-slate-400">Start your first secure wipe in minutes.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/register?returnTo=/portal"
              className="rounded-lg bg-cyan-500 px-5 py-3 text-sm font-medium text-slate-950 hover:bg-cyan-400 transition"
            >
              Get Started
            </Link>
            <Link
              to="/login?returnTo=/portal"
              className="rounded-lg border border-white/15 px-5 py-3 text-sm font-medium text-slate-200 hover:bg-white/5 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 md:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span>ZeroTrace AI · Secure. Verify. Prove. Recycle.</span>
          </div>
          <div className="flex gap-5">
            <a href="#problem" className="hover:text-slate-300 transition">About</a>
            <a href="#features" className="hover:text-slate-300 transition">Security</a>
            <a href="#how" className="hover:text-slate-300 transition">Compliance</a>
            <Link to="/verify" className="hover:text-slate-300 transition">Verify</Link>
            <a href="#problem" className="hover:text-slate-300 transition">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
