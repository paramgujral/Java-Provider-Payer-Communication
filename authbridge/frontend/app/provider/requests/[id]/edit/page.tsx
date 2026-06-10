"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/StatCard";
import { RequestForm, fromRequest, type FormState } from "@/components/RequestForm";
import { StatusBadge } from "@/components/Badge";
import type { AuthRequest, ClinicalDocument } from "@/lib/types";

export default function EditRequest() {
  const { id } = useParams<{ id: string }>();
  const [req, setReq] = useState<AuthRequest | null>(null);
  const [state, setState] = useState<FormState | null>(null);
  const [docs, setDocs] = useState<ClinicalDocument[]>([]);

  useEffect(() => {
    fetch(`/api/requests/${id}`)
      .then((r) => r.json())
      .then((j) => {
        const r: AuthRequest = j.data;
        setReq(r);
        const mapped = fromRequest(r);
        setState(mapped.state);
        setDocs(mapped.documents);
      });
  }, [id]);

  if (!req || !state) {
    return <div className="card grid place-items-center py-20 text-sm text-slate-400">Loading…</div>;
  }

  const resubmitContext = req.status === "DENIED" || req.status === "INFO_REQUESTED";

  return (
    <div>
      <Link href={`/provider/requests/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        ← Back to request
      </Link>

      <PageHeader
        title="Edit request"
        subtitle={`${req.referenceNo} · ${req.serviceRequested}`}
        action={<StatusBadge status={req.status} />}
      />

      {resubmitContext && req.decisionNote && (
        <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${req.status === "DENIED" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
          <span className="font-semibold">{req.status === "DENIED" ? "Reason for denial: " : "Payer requested: "}</span>
          {req.decisionNote}
          <p className="mt-1 text-xs opacity-80">Update the request below to address this, then resubmit.</p>
        </div>
      )}

      <RequestForm
        mode="edit"
        requestId={req.id}
        status={req.status}
        initialState={state}
        initialDocuments={docs}
      />
    </div>
  );
}
