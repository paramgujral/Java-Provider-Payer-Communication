import Link from "next/link";
import { Logo } from "@/components/Logo";
import {
  IconArrowRight,
  IconBell,
  IconChart,
  IconShield,
  IconSparkle,
  IconUsers,
} from "@/components/icons";

const FEATURES = [
  {
    icon: IconSparkle,
    title: "AI Copilot",
    body: "Reviews every request before submission — flags missing data, format errors, and policy gaps, and predicts approval likelihood.",
  },
  {
    icon: IconUsers,
    title: "Provider ↔ Payer workflow",
    body: "One shared workspace for submission, review, additional-info loops, decisions, and resubmissions — with full audit trails.",
  },
  {
    icon: IconBell,
    title: "Real-time tracking",
    body: "Live status on every request with in-app, email, and SMS notifications the moment something changes.",
  },
  {
    icon: IconShield,
    title: "Compliant by design",
    body: "RBAC, OAuth2/OIDC, encryption in transit and at rest, and immutable audit logs built for HIPAA.",
  },
];

const STATS = [
  { value: "43%", label: "fewer rejected submissions" },
  { value: "2.1d", label: "faster median decision" },
  { value: "92%", label: "first-pass completeness" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost">
            Sign in
          </Link>
          <Link href="/login" className="btn-primary">
            Launch demo <IconArrowRight width={16} height={16} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-white" />
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
              <IconSparkle width={14} height={14} /> AI-powered prior authorization
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
              Prior auth that
              <span className="bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
                {" "}
                approves faster
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
              AuthBridge connects hospitals and insurers on one intelligent platform. An AI copilot
              validates every authorization request before it&rsquo;s sent — cutting rework, raising
              approval rates, and giving both sides real-time visibility.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/login?role=PROVIDER" className="btn-primary px-5 py-2.5 text-base">
                I&rsquo;m a Provider <IconArrowRight width={18} height={18} />
              </Link>
              <Link href="/login?role=PAYER" className="btn-secondary px-5 py-2.5 text-base">
                I&rsquo;m a Payer
              </Link>
            </div>
          </div>

          {/* Stat band */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-brand-700 md:text-4xl">{s.value}</p>
                <p className="mt-1 text-xs text-slate-500 md:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card p-5 transition hover:shadow-cardhover">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon />
                </span>
                <h3 className="mt-4 font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lifecycle strip */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            The authorization lifecycle, end to end
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            {["Draft", "Copilot review", "Submit", "Payer review", "Decision", "Notify"].map(
              (step, i, arr) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="rounded-full border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm">
                    {step}
                  </span>
                  {i < arr.length - 1 && <IconArrowRight className="text-slate-300" width={18} height={18} />}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <IconChart className="mx-auto text-brand-500" width={32} height={32} />
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
          See both sides of the workflow
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Explore the live demo as a provider submitting requests or a payer reviewing them. No
          sign-up required.
        </p>
        <Link href="/login" className="btn-primary mx-auto mt-6 w-fit px-6 py-3 text-base">
          Launch the demo <IconArrowRight width={18} height={18} />
        </Link>
      </section>

      <footer className="bg-navy-900 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-slate-400 md:flex-row">
          <Logo className="[&_span]:text-white" />
          <p>© 2026 AuthBridge · Demonstration platform · HIPAA-aligned architecture</p>
        </div>
      </footer>
    </div>
  );
}
