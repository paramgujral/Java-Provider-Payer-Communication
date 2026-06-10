"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CopilotPanel } from "@/components/CopilotPanel";
import { PriorityBadge, StatusBadge } from "@/components/Badge";
import { Timeline } from "@/components/Timeline";
import { IconArrowRight, IconDoc } from "@/components/icons";
import { getSession } from "@/lib/session";
import type { AuthRequest } from "@/lib/types";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-800">{value || "—"}</dd>
    </div>
  );
}

export default function ProviderRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const [req, setReq] = useState<AuthRequest | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    fetch(`/api/requests/${id}`)
      .then((r) => r.json())
      .then((j) => setReq(j.data ?? null));
  }
  useEffect(load, [id]);

  async function action(to: string, note?: string) {
    setBusy(true);
    const s = getSession();
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ to, note, actor: { name: `${s?.name} · ${s?.org}`, role: "PROVIDER" } }),
    });
    load();
    setBusy(false);
  }

  if (!req) return <div className="card grid place-items-center py-20 text-sm text-slate-400">Loading…</div>;

  const canResubmit = req.status === "INFO_REQUESTED" || req.status === "DENIED";
  const canSubmit = req.status === "DRAFT";

  return (
    <div>
      <Link href="/provider/requests" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        ← Back to requests
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{req.serviceRequested}</h1>
            <PriorityBadge priority={req.priority} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {req.referenceNo} · to {req.payerOrg}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={req.status} />
          {canSubmit && (
            <>
              <Link href={`/provider/requests/${req.id}/edit`} className="btn-secondary">
                Edit
              </Link>
              <button onClick={() => action("SUBMITTED")} disabled={busy} className="btn-primary">
                Submit to payer <IconArrowRight width={16} height={16} />
              </button>
            </>
          )}
          {canResubmit && (
            <Link href={`/provider/requests/${req.id}/edit`} className="btn-primary">
              Edit &amp; resubmit <IconArrowRight width={16} height={16} />
            </Link>
          )}
        </div>
      </div>

      {req.decisionNote && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            req.status === "APPROVED"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : req.status === "DENIED"
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <span className="font-semibold">Payer note: </span>
          {req.decisionNote}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Request details</h2>
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <Field label="CPT / HCPCS" value={req.cptCodes.join(", ")} />
              <Field label="ICD-10" value={req.icd10Codes.join(", ")} />
              <Field label="Units" value={req.requestedUnits} />
              <Field label="Place of service" value={req.placeOfService} />
              <Field label="Patient" value={req.patientName} />
              <Field label="Member ID" value={req.memberId} />
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Clinical justification</h2>
            <p className="text-sm leading-relaxed text-slate-700">{req.clinicalJustification || "—"}</p>
          </section>

          <section className="card p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
              Documents ({req.documents.length})
            </h2>
            {req.documents.length === 0 ? (
              <p className="text-sm text-slate-400">No documents attached.</p>
            ) : (
              <ul className="space-y-2">
                {req.documents.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <IconDoc className="text-slate-400" width={18} height={18} />
                    <span className="font-medium text-slate-700">{d.name}</span>
                    <span className="ml-auto text-xs text-slate-400">{d.type} · {d.sizeKb} KB</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {req.copilot && <CopilotPanel review={req.copilot} />}
          <section className="card p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Activity &amp; audit trail</h2>
            <Timeline events={req.timeline} />
          </section>
        </div>
      </div>
    </div>
  );
}
