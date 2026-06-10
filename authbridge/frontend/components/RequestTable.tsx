"use client";

import Link from "next/link";
import type { AuthRequest } from "@/lib/types";
import { timeAgo } from "@/lib/ui";
import { PriorityBadge, StatusBadge } from "./Badge";

export function RequestTable({
  requests,
  hrefBase,
  showProvider = false,
}: {
  requests: AuthRequest[];
  hrefBase: string; // e.g. "/provider/requests" or "/payer/review"
  showProvider?: boolean;
}) {
  if (requests.length === 0) {
    return (
      <div className="card grid place-items-center py-16 text-center">
        <p className="text-sm text-slate-400">No requests to show.</p>
      </div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Reference</th>
              <th className="px-4 py-3 font-semibold">Service</th>
              <th className="px-4 py-3 font-semibold">{showProvider ? "Provider" : "Patient"}</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Copilot</th>
              <th className="px-4 py-3 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((r) => (
              <tr key={r.id} className="group hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`${hrefBase}/${r.id}`} className="font-semibold text-brand-600 hover:underline">
                    {r.referenceNo}
                  </Link>
                  <div className="mt-1"><PriorityBadge priority={r.priority} /></div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{r.serviceRequested}</p>
                  <p className="text-xs text-slate-400">{r.cptCodes.join(", ") || "—"}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {showProvider ? r.providerOrg : r.patientName}
                </td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3">
                  {r.copilot ? (
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-16 overflow-hidden rounded-full bg-slate-200">
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${r.copilot.approvalLikelihood}%`,
                            backgroundColor:
                              r.copilot.approvalLikelihood >= 80
                                ? "#10b981"
                                : r.copilot.approvalLikelihood >= 60
                                ? "#f59e0b"
                                : "#f43f5e",
                          }}
                        />
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {r.copilot.approvalLikelihood}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{timeAgo(r.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
