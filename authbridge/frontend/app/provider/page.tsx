"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader, StatCard } from "@/components/StatCard";
import { RequestTable } from "@/components/RequestTable";
import { IconClock, IconDoc, IconPlus, IconSparkle } from "@/components/icons";
import type { AuthRequest } from "@/lib/types";

export default function ProviderDashboard() {
  const [requests, setRequests] = useState<AuthRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/requests")
      .then((r) => r.json())
      .then((j) => setRequests(j.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const pending = requests.filter((r) => ["SUBMITTED", "IN_REVIEW", "RESUBMITTED"].includes(r.status));
  const needsAction = requests.filter((r) => ["INFO_REQUESTED", "DENIED", "DRAFT"].includes(r.status));
  const approved = requests.filter((r) => r.status === "APPROVED");
  const avgApproval =
    requests.length > 0
      ? Math.round(
          requests.reduce((s, r) => s + (r.copilot?.approvalLikelihood ?? 0), 0) / requests.length,
        )
      : 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Your prior authorization activity at a glance."
        action={
          <Link href="/provider/requests/new" className="btn-primary">
            <IconPlus width={18} height={18} /> New request
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending with payer" value={pending.length} accent="text-violet-600" icon={<IconClock />} sub="Submitted or in review" />
        <StatCard label="Needs your action" value={needsAction.length} accent="text-amber-600" icon={<IconDoc />} sub="Drafts, info requests, denials" />
        <StatCard label="Approved" value={approved.length} accent="text-emerald-600" icon={<IconDoc />} sub="Active authorizations" />
        <StatCard label="Avg. copilot score" value={`${avgApproval}%`} accent="text-brand-600" icon={<IconSparkle />} sub="Predicted approval likelihood" />
      </div>

      {needsAction.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900">
            Needs your attention
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
              {needsAction.length}
            </span>
          </h2>
          <RequestTable requests={needsAction} hrefBase="/provider/requests" />
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent requests</h2>
          <Link href="/provider/requests" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="card grid place-items-center py-16 text-sm text-slate-400">Loading…</div>
        ) : (
          <RequestTable requests={requests.slice(0, 5)} hrefBase="/provider/requests" />
        )}
      </div>
    </div>
  );
}
