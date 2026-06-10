"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CopilotPanel } from "@/components/CopilotPanel";
import { IconUpload, IconX } from "@/components/icons";
import { getSession } from "@/lib/session";
import type { AuthRequest, ClinicalDocument, CopilotReview, Priority, RequestStatus } from "@/lib/types";

export interface FormState {
  serviceRequested: string;
  cptCodes: string;
  icd10Codes: string;
  priority: Priority;
  placeOfService: string;
  requestedUnits: number;
  patientName: string;
  patientDob: string;
  memberId: string;
  payerOrg: string;
  clinicalJustification: string;
}

const EMPTY: FormState = {
  serviceRequested: "",
  cptCodes: "",
  icd10Codes: "",
  priority: "ROUTINE",
  placeOfService: "Outpatient Hospital",
  requestedUnits: 1,
  patientName: "",
  patientDob: "",
  memberId: "",
  payerOrg: "Meridian Health Plan",
  clinicalJustification: "",
};

/** Build form state from an existing request (edit mode). */
export function fromRequest(r: AuthRequest): { state: FormState; documents: ClinicalDocument[] } {
  return {
    state: {
      serviceRequested: r.serviceRequested,
      cptCodes: r.cptCodes.join(", "),
      icd10Codes: r.icd10Codes.join(", "),
      priority: r.priority,
      placeOfService: r.placeOfService,
      requestedUnits: r.requestedUnits,
      patientName: r.patientName,
      patientDob: r.patientDob,
      memberId: r.memberId,
      payerOrg: r.payerOrg,
      clinicalJustification: r.clinicalJustification,
    },
    documents: r.documents ?? [],
  };
}

function toPayload(f: FormState, documents: ClinicalDocument[]) {
  return {
    ...f,
    cptCodes: f.cptCodes.split(",").map((s) => s.trim()).filter(Boolean),
    icd10Codes: f.icd10Codes.split(",").map((s) => s.trim()).filter(Boolean),
    documents,
  };
}

export function RequestForm({
  mode,
  requestId,
  status,
  initialState,
  initialDocuments = [],
}: {
  mode: "new" | "edit";
  requestId?: string;
  status?: RequestStatus;
  initialState?: FormState;
  initialDocuments?: ClinicalDocument[];
}) {
  const router = useRouter();
  const [f, setF] = useState<FormState>(initialState ?? EMPTY);
  const [documents, setDocuments] = useState<ClinicalDocument[]>(initialDocuments);
  const [review, setReview] = useState<CopilotReview | undefined>();
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const set = (k: keyof FormState, v: string | number) => setF((p) => ({ ...p, [k]: v }));

  const runCopilot = useCallback((state: FormState, docs: ClinicalDocument[]) => {
    setAnalyzing(true);
    fetch("/api/copilot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toPayload(state, docs)),
    })
      .then((r) => r.json())
      .then((j) => setReview(j.data))
      .finally(() => setAnalyzing(false));
  }, []);

  // Live, debounced copilot review as the form changes. In edit mode we review immediately.
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    const hasContent = f.serviceRequested || f.cptCodes || f.clinicalJustification;
    if (!hasContent) {
      setReview(undefined);
      return;
    }
    debounce.current = setTimeout(() => runCopilot(f, documents), 500);
    return () => debounce.current && clearTimeout(debounce.current);
  }, [f, documents, runCopilot]);

  function addMockDoc(type: string) {
    setDocuments((d) => [
      ...d,
      {
        id: `doc_${Math.random().toString(36).slice(2, 8)}`,
        name: `${type.toLowerCase().replace(/\s+/g, "-")}.pdf`,
        type,
        sizeKb: 120 + Math.round(Math.random() * 400),
        uploadedAt: new Date().toISOString(),
      },
    ]);
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  const session = getSession();

  async function createNew(asDraft: boolean) {
    setSubmitting(true);
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...toPayload(f, documents),
        status: asDraft ? "DRAFT" : "SUBMITTED",
        submittedBy: session?.name,
        providerOrg: session?.org,
      }),
    });
    const json = await res.json();
    router.push(`/provider/requests/${json.data.id}`);
  }

  // Edit mode: persist field changes, then optionally transition (submit / resubmit).
  async function saveEdit(transitionTo?: RequestStatus) {
    if (!requestId) return;
    setSubmitting(true);
    await fetch(`/api/requests/${requestId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...toPayload(f, documents), editor: session?.name }),
    });
    if (transitionTo) {
      const note =
        transitionTo === "RESUBMITTED"
          ? "Resubmitted with updated information after revisions."
          : undefined;
      await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          to: transitionTo,
          note,
          actor: { name: `${session?.name} · ${session?.org}`, role: "PROVIDER" },
        }),
      });
    }
    router.push(`/provider/requests/${requestId}`);
  }

  const blocking = review?.issues.filter((i) => i.severity === "ERROR").length ?? 0;
  const canResubmit = mode === "edit" && (status === "DENIED" || status === "INFO_REQUESTED");
  const isDraftEdit = mode === "edit" && status === "DRAFT";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Form */}
      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Service requested</h2>
          <div className="grid gap-4">
            <div>
              <label className="label">Service / procedure</label>
              <input className="input" placeholder="e.g. MRI lumbar spine without contrast" value={f.serviceRequested} onChange={(e) => set("serviceRequested", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">CPT / HCPCS codes</label>
                <input className="input" placeholder="72148" value={f.cptCodes} onChange={(e) => set("cptCodes", e.target.value)} />
                <p className="mt-1 text-xs text-slate-400">Comma-separated</p>
              </div>
              <div>
                <label className="label">ICD-10 codes</label>
                <input className="input" placeholder="M54.16" value={f.icd10Codes} onChange={(e) => set("icd10Codes", e.target.value)} />
                <p className="mt-1 text-xs text-slate-400">Comma-separated</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Priority</label>
                <select className="input" value={f.priority} onChange={(e) => set("priority", e.target.value as Priority)}>
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="STAT">STAT</option>
                </select>
              </div>
              <div>
                <label className="label">Place of service</label>
                <select className="input" value={f.placeOfService} onChange={(e) => set("placeOfService", e.target.value)}>
                  <option>Outpatient Hospital</option>
                  <option>Inpatient Hospital</option>
                  <option>Office</option>
                  <option>Ambulatory Surgical Center</option>
                </select>
              </div>
              <div>
                <label className="label">Units</label>
                <input type="number" min={1} className="input" value={f.requestedUnits} onChange={(e) => set("requestedUnits", Number(e.target.value))} />
              </div>
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Patient &amp; coverage</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Patient name</label>
              <input className="input" placeholder="Jordan T." value={f.patientName} onChange={(e) => set("patientName", e.target.value)} />
            </div>
            <div>
              <label className="label">Date of birth</label>
              <input type="date" className="input" value={f.patientDob} onChange={(e) => set("patientDob", e.target.value)} />
            </div>
            <div>
              <label className="label">Member ID</label>
              <input className="input" placeholder="MRD-0000000" value={f.memberId} onChange={(e) => set("memberId", e.target.value)} />
            </div>
            <div>
              <label className="label">Payer</label>
              <select className="input" value={f.payerOrg} onChange={(e) => set("payerOrg", e.target.value)}>
                <option>Meridian Health Plan</option>
                <option>Atlas Mutual Insurance</option>
                <option>Summit Care</option>
              </select>
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Clinical justification</h2>
          <textarea
            className="input min-h-[140px] resize-y"
            placeholder="Describe symptoms, duration, conservative treatments tried and their outcomes, and the expected clinical benefit…"
            value={f.clinicalJustification}
            onChange={(e) => set("clinicalJustification", e.target.value)}
          />
        </section>

        <section className="card p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Supporting documents</h2>
          <div className="flex flex-wrap gap-2">
            {["Clinical Notes", "Lab Result", "Imaging", "Therapy Summary"].map((t) => (
              <button key={t} onClick={() => addMockDoc(t)} className="btn-secondary px-3 py-1.5 text-xs">
                <IconUpload width={14} height={14} /> {t}
              </button>
            ))}
          </div>
          {documents.length > 0 && (
            <ul className="mt-4 space-y-2">
              {documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-700">{d.name}</span>
                  <span className="flex items-center gap-3 text-xs text-slate-400">
                    {d.type} · {d.sizeKb} KB
                    <button onClick={() => setDocuments((ds) => ds.filter((x) => x.id !== d.id))} className="text-slate-400 hover:text-rose-500">
                      <IconX width={14} height={14} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Action bar — mode aware */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          {mode === "new" && (
            <>
              <button onClick={() => createNew(true)} disabled={submitting} className="btn-secondary">Save draft</button>
              <button onClick={() => createNew(false)} disabled={submitting || blocking > 0} className="btn-primary">
                {blocking > 0 ? `Resolve ${blocking} blocking issue${blocking > 1 ? "s" : ""}` : "Submit to payer"}
              </button>
            </>
          )}

          {mode === "edit" && (
            <>
              <button onClick={() => saveEdit()} disabled={submitting} className="btn-secondary">Save changes</button>
              {canResubmit && (
                <button onClick={() => saveEdit("RESUBMITTED")} disabled={submitting || blocking > 0} className="btn-primary">
                  {blocking > 0 ? `Resolve ${blocking} blocking issue${blocking > 1 ? "s" : ""}` : "Save & resubmit to payer"}
                </button>
              )}
              {isDraftEdit && (
                <button onClick={() => saveEdit("SUBMITTED")} disabled={submitting || blocking > 0} className="btn-primary">
                  {blocking > 0 ? `Resolve ${blocking} blocking issue${blocking > 1 ? "s" : ""}` : "Submit to payer"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Copilot rail */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <CopilotPanel review={review} loading={analyzing} onApplyNarrative={(text) => set("clinicalJustification", text)} />
      </div>
    </div>
  );
}
