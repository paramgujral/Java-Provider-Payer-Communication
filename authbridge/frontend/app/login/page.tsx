"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "@/components/Logo";
import { IconArrowRight, IconBuilding, IconHospital, IconShield } from "@/components/icons";
import { DEMO_CREDENTIALS, login } from "@/lib/session";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const presetRole = params.get("role");
  const preset = DEMO_CREDENTIALS.find((c) => c.session.role === presetRole);

  const [email, setEmail] = useState(preset?.email ?? "");
  const [password, setPassword] = useState(preset?.password ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const session = login(email, password);
    if (!session) {
      setError("Invalid email or password. Use one of the demo accounts below.");
      setBusy(false);
      return;
    }
    router.push(session.role === "PROVIDER" ? "/provider" : "/payer");
  }

  function fill(cred: (typeof DEMO_CREDENTIALS)[number]) {
    setEmail(cred.email);
    setPassword(cred.password);
    setError(null);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — Feuji-style navy brand panel with orange accents */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy-900 p-10 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <Link href="/" className="relative w-fit" aria-label="Back to home">
          <Logo className="[&_span]:text-white" />
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-tight">
            Intelligent prior authorization for providers and payers.
          </h2>
          <p className="mt-3 max-w-md text-slate-300">
            Submit, review, and decide authorizations with an AI copilot that catches problems
            before they cause delays.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <IconShield width={16} height={16} className="text-brand-400" /> HIPAA-aligned · RBAC · audit logging
            </li>
            <li className="flex items-center gap-2">
              <IconArrowRight width={16} height={16} className="text-brand-400" /> Real-time status &amp; notifications
            </li>
          </ul>
        </div>
        <p className="relative text-xs text-slate-400">Demonstration environment — synthetic data only.</p>
      </div>

      {/* Right — dummy login form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" aria-label="Back to home">
              <Logo />
            </Link>
          </div>
          <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-brand-600">
            ← Back to home
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Sign in to AuthBridge</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your credentials to access your portal.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                className="input"
                placeholder="you@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full py-2.5">
              Sign in <IconArrowRight width={18} height={18} />
            </button>
          </form>

          {/* Demo credential helpers */}
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Demo accounts — click to fill
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {DEMO_CREDENTIALS.map((c) => (
                <button
                  key={c.email}
                  type="button"
                  onClick={() => fill(c)}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-left transition hover:border-brand-400 hover:bg-brand-50"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                    {c.session.role === "PROVIDER" ? <IconHospital width={18} height={18} /> : <IconBuilding width={18} height={18} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-800">
                      {c.session.role === "PROVIDER" ? "Provider" : "Payer"}
                    </span>
                    <span className="block truncate text-xs text-slate-500">{c.email}</span>
                    <span className="block text-xs text-slate-400">pw: {c.password}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Production uses OAuth2 / OpenID Connect SSO. This is a non-production demo with synthetic PHI.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
