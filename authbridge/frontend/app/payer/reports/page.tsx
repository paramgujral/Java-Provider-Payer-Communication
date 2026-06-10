"use client";

import { useEffect, useState } from "react";
import { PageHeader, StatCard } from "@/components/StatCard";
import { STATUS_CLASSES, STATUS_LABEL } from "@/lib/ui";
import type { AuthRequest, RequestStatus } from "@/lib/types";

export default function PayerReports() {
  const [requests, setRequests] = useState<AuthRequest[]>([]);

  useEffect(() => {
    fetch("/api/requests")
      .then((r) => r.json())
      .then((j) => setRequests((j.data ?? []).filter((r: AuthRequest) => r.status !== "DRAFT")));
  }, []);

  const byStatus = (Object.keys(STATUS_LABEL) as RequestStatus[])
    .filter((s) => s !== "DRAFT")
    .map((s) => ({ status: s, count: requests.filter((r) => r.status === s).length }));
  const max = Math.max(1, ...byStatus.map((b) => b.count));

  const decided = requests.filter((r) => ["APPROVED", "DENIED"].includes(r.status));
  const approvalRate = decided.length ? Math.round((decided.filter((r) => r.status === "APPROVED").length / decided.length) * 100) : 0;
  const avgCopilot = requests.length
    ? Math.round(requests.reduce((s, r) => s + (r.copilot?.approvalLikelihood ?? 0), 0) / requests.length)
    : 0;

  return (
    <div>
      <PageHeader title="Reports &amp; Compliance" subtitle="Operational metrics across all submitted requests." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total requests" value={requests.length} />
        <StatCard label="Decided" value={decided.length} />
        <StatCard label="Approval rate" value={`${approvalRate}%`} accent="text-emerald-600" />
        <StatCard label="Avg copilot score" value={`${avgCopilot}%`} accent="text-brand-600" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Requests by status</h2>
          <div className="space-y-3">
            {byStatus.map((b) => (
              <div key={b.status} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm font-medium text-slate-600">{STATUS_LABEL[b.status]}</span>
                <div className="h-6 flex-1 overflow-hidden rounded bg-slate-100">
                  <div
                    className={`flex h-full items-center justify-end rounded px-2 text-xs font-bold ${STATUS_CLASSES[b.status]}`}
                    style={{ width: `${Math.max(8, (b.count / max) * 100)}%` }}
                  >
                    {b.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Compliance posture</h2>
          <ul className="space-y-3 text-sm">
            {[
              ["Immutable audit trail", "Every status change is appended with actor, timestamp, and note."],
              ["RBAC enforced", "Providers see only their org; payers never see drafts."],
              ["PHI minimization", "Patient identifiers de-identified in this environment."],
              ["Encryption", "TLS in transit; column-level encryption at rest (prod)."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">✓</span>
                <div>
                  <p className="font-semibold text-slate-800">{t}</p>
                  <p className="text-xs text-slate-500">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
