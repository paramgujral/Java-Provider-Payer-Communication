"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader, StatCard } from "@/components/StatCard";
import { RequestTable } from "@/components/RequestTable";
import { IconCheck, IconClock, IconInbox, IconSparkle } from "@/components/icons";
import type { AuthRequest } from "@/lib/types";

export default function PayerDashboard() {
  const [requests, setRequests] = useState<AuthRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/requests")
      .then((r) => r.json())
      .then((j) => setRequests(j.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  // Payers never see drafts — only what providers have submitted.
  const visible = requests.filter((r) => r.status !== "DRAFT");
  const queue = visible.filter((r) => ["SUBMITTED", "IN_REVIEW", "RESUBMITTED"].includes(r.status));
  const awaiting = visible.filter((r) => r.status === "INFO_REQUESTED");
  const decided = visible.filter((r) => ["APPROVED", "DENIED"].includes(r.status));
  const approvalRate =
    decided.length > 0
      ? Math.round((decided.filter((r) => r.status === "APPROVED").length / decided.length) * 100)
      : 0;

  return (
    <div>
      <PageHeader
        title="Reviewer Dashboard"
        subtitle="Utilization review workload for Meridian Health Plan."
        action={
          <Link href="/payer/queue" className="btn-primary">
            <IconInbox width={18} height={18} /> Open queue
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="In your queue" value={queue.length} accent="text-violet-600" icon={<IconClock />} sub="Awaiting review decision" />
        <StatCard label="Awaiting provider" value={awaiting.length} accent="text-amber-600" icon={<IconInbox />} sub="Info requested" />
        <StatCard label="Decided" value={decided.length} accent="text-slate-900" icon={<IconCheck />} sub="Approved or denied" />
        <StatCard label="Approval rate" value={`${approvalRate}%`} accent="text-emerald-600" icon={<IconSparkle />} sub="Across decided requests" />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            Review queue
            {queue.length > 0 && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">{queue.length}</span>
            )}
          </h2>
          <Link href="/payer/queue" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="card grid place-items-center py-16 text-sm text-slate-400">Loading…</div>
        ) : (
          <RequestTable requests={queue} hrefBase="/payer/review" showProvider />
        )}
      </div>
    </div>
  );
}
