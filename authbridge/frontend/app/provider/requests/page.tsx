"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/StatCard";
import { RequestTable } from "@/components/RequestTable";
import { IconPlus } from "@/components/icons";
import { STATUS_LABEL } from "@/lib/ui";
import type { AuthRequest, RequestStatus } from "@/lib/types";

const FILTERS: (RequestStatus | "ALL")[] = [
  "ALL",
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "INFO_REQUESTED",
  "APPROVED",
  "DENIED",
];

export default function ProviderRequests() {
  const [requests, setRequests] = useState<AuthRequest[]>([]);
  const [filter, setFilter] = useState<RequestStatus | "ALL">("ALL");
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/requests")
      .then((r) => r.json())
      .then((j) => setRequests(j.data ?? []));
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (filter !== "ALL" && r.status !== filter) return false;
      if (q && !`${r.referenceNo} ${r.serviceRequested} ${r.patientName}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [requests, filter, q]);

  return (
    <div>
      <PageHeader
        title="My Requests"
        subtitle="All authorization requests submitted by your organization."
        action={
          <Link href="/provider/requests/new" className="btn-primary">
            <IconPlus width={18} height={18} /> New request
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search reference, service, patient…"
          className="input max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filter === f ? "bg-brand-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {f === "ALL" ? "All" : STATUS_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      <RequestTable requests={filtered} hrefBase="/provider/requests" />
    </div>
  );
}
