"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/StatCard";
import { RequestTable } from "@/components/RequestTable";
import { STATUS_LABEL } from "@/lib/ui";
import type { AuthRequest, RequestStatus } from "@/lib/types";

const FILTERS: (RequestStatus | "ALL")[] = [
  "ALL",
  "SUBMITTED",
  "IN_REVIEW",
  "RESUBMITTED",
  "INFO_REQUESTED",
  "APPROVED",
  "DENIED",
];

export default function PayerQueue() {
  const [requests, setRequests] = useState<AuthRequest[]>([]);
  const [filter, setFilter] = useState<RequestStatus | "ALL">("ALL");
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/requests")
      .then((r) => r.json())
      .then((j) => setRequests((j.data ?? []).filter((r: AuthRequest) => r.status !== "DRAFT")));
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (filter !== "ALL" && r.status !== filter) return false;
      if (q && !`${r.referenceNo} ${r.serviceRequested} ${r.providerOrg}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [requests, filter, q]);

  return (
    <div>
      <PageHeader title="Review Queue" subtitle="Authorization requests submitted by providers." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search reference, service, provider…"
          className="input max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((ff) => (
            <button
              key={ff}
              onClick={() => setFilter(ff)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filter === ff ? "bg-brand-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {ff === "ALL" ? "All" : STATUS_LABEL[ff]}
            </button>
          ))}
        </div>
      </div>

      <RequestTable requests={filtered} hrefBase="/payer/review" showProvider />
    </div>
  );
}
