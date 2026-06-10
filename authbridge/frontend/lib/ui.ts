import type { Priority, RequestStatus } from "./types";

// Status / priority presentation helpers shared by all client components.

export const STATUS_LABEL: Record<RequestStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  IN_REVIEW: "In review",
  INFO_REQUESTED: "Info requested",
  APPROVED: "Approved",
  DENIED: "Denied",
  RESUBMITTED: "Resubmitted",
};

export const STATUS_CLASSES: Record<RequestStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
  SUBMITTED: "bg-blue-50 text-blue-700 ring-blue-200",
  IN_REVIEW: "bg-violet-50 text-violet-700 ring-violet-200",
  INFO_REQUESTED: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  DENIED: "bg-rose-50 text-rose-700 ring-rose-200",
  RESUBMITTED: "bg-cyan-50 text-cyan-700 ring-cyan-200",
};

export const PRIORITY_CLASSES: Record<Priority, string> = {
  ROUTINE: "bg-slate-100 text-slate-600 ring-slate-200",
  URGENT: "bg-orange-50 text-orange-700 ring-orange-200",
  STAT: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-rose-600";
}

export function scoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
