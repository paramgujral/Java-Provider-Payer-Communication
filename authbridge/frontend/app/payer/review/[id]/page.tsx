"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CopilotPanel } from "@/components/CopilotPanel";
import { PriorityBadge, StatusBadge } from "@/components/Badge";
import { Timeline } from "@/components/Timeline";
import { IconCheck, IconDoc, IconX } from "@/components/icons";
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

export default function PayerReview() {
  const { id } = useParams<{ id: string }>();
  const [req, setReq] = useState<AuthRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<"APPROVED" | "DENIED" | "INFO_REQUESTED" | null>(null);

  function pick(d: "APPROVED" | "DENIED" | "INFO_REQUESTED") {
    setDecision(d);
    setNote("");
    setError(null);
  }

  function load() {
    fetch(`/api/requests/${id}`)
      .then((r) => r.json())
      .then((j) => setReq(j.data ?? null));
  }
  useEffect(load, [id]);

  async function startReview() {
    setBusy(true);
    const s = getSession();
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ to: "IN_REVIEW", actor: { name: `${s?.name} · ${s?.org}`, role: "PAYER" } }),
    });
    load();
    setBusy(false);
  }

  // A decision is binding and goes on the audit trail, so a reason is mandatory.
  const MIN_REASON = 10;
  const reason = note.trim();
  const reasonValid = reason.length >= MIN_REASON;

  async function decide() {
    if (!decision) return;
    if (!reasonValid) {
      setError(`Please enter a valid reason (at least ${MIN_REASON} characters) before confirming.`);
      return;
    }
    setError(null);
    setBusy(true);
    const s = getSession();
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        to: decision,
        note: reason,
        actor: { name: `${s?.name} · ${s?.org}`, role: "PAYER" },
      }),
    });
    setDecision(null);
    setNote("");
    load();
    setBusy(false);
  }

  if (!req) return <div className="card grid place-items-center py-20 text-sm text-slate-400">Loading…</div>;

  const open = ["SUBMITTED", "IN_REVIEW", "RESUBMITTED", "INFO_REQUESTED"].includes(req.status);
  const needsStart = req.status === "SUBMITTED" || req.status === "RESUBMITTED";

  return (
    <div>
      <Link href="/payer/queue" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        ← Back to queue
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{req.serviceRequested}</h1>
            <PriorityBadge priority={req.priority} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {req.referenceNo} · from {req.providerOrg} · submitted by {req.submittedBy ?? "—"}
          </p>
        </div>
        <StatusBadge status={req.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Clinical request</h2>
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
              Submitted documents ({req.documents.length})
            </h2>
            {req.documents.length === 0 ? (
              <p className="text-sm text-rose-500">No supporting documents — consider requesting more information.</p>
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

          {/* Decision panel */}
          {open && (
            <section className="card p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Review decision</h2>
              {needsStart ? (
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                  <p className="text-sm text-slate-600">Pick up this request to begin your review.</p>
                  <button onClick={startReview} disabled={busy} className="btn-primary">
                    Start review
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <DecisionButton active={decision === "APPROVED"} onClick={() => pick("APPROVED")} tone="emerald" label="Approve" icon={<IconCheck width={16} height={16} />} />
                    <DecisionButton active={decision === "INFO_REQUESTED"} onClick={() => pick("INFO_REQUESTED")} tone="amber" label="Request info" />
                    <DecisionButton active={decision === "DENIED"} onClick={() => pick("DENIED")} tone="rose" label="Deny" icon={<IconX width={16} height={16} />} />
                  </div>
                  {decision && (
                    <div className="mt-4">
                      <label className="label flex items-center justify-between">
                        <span>
                          {decision === "APPROVED" ? "Approval reason (auth #, validity)" : decision === "DENIED" ? "Denial reason (policy reference)" : "What information is needed?"}
                          <span className="ml-1 text-rose-500">*</span>
                        </span>
                        <span className={`text-xs font-normal ${reasonValid ? "text-emerald-600" : "text-slate-400"}`}>
                          {reasonValid ? "✓ reason provided" : `${reason.length}/${MIN_REASON} min`}
                        </span>
                      </label>
                      <textarea
                        className={`input min-h-[90px] ${error && !reasonValid ? "border-rose-400 focus:border-rose-400 focus:ring-rose-200" : ""}`}
                        value={note}
                        onChange={(e) => {
                          setNote(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder={
                          decision === "APPROVED"
                            ? "Approved. Auth #… valid 90 days."
                            : decision === "DENIED"
                            ? "Does not meet policy … (state the specific policy and what was not met)"
                            : "Please attach …"
                        }
                      />
                      <p className="mt-1.5 text-xs text-slate-400">
                        {decision === "DENIED"
                          ? "A clear, policy-based reason is required and is sent to the provider and recorded in the audit trail."
                          : "This reason is sent to the provider and recorded in the audit trail."}
                      </p>
                      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
                      <div className="mt-3 flex justify-end gap-2">
                        <button onClick={() => { setDecision(null); setError(null); }} className="btn-secondary">Cancel</button>
                        <button onClick={decide} disabled={busy || !reasonValid} className="btn-primary">
                          {decision === "APPROVED" ? "Confirm approval" : decision === "DENIED" ? "Confirm rejection" : "Send request"}
                          &nbsp;&amp; notify provider
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {req.decisionNote && !open && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${req.status === "APPROVED" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
              <span className="font-semibold">Decision: </span>
              {req.decisionNote}
            </div>
          )}
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

function DecisionButton({
  active,
  onClick,
  tone,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  tone: "emerald" | "amber" | "rose";
  label: string;
  icon?: React.ReactNode;
}) {
  const tones = {
    emerald: active ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:border-emerald-300",
    amber: active ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-600 hover:border-amber-300",
    rose: active ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-600 hover:border-rose-300",
  };
  return (
    <button onClick={onClick} className={`flex items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition ${tones[tone]}`}>
      {icon}
      {label}
    </button>
  );
}
