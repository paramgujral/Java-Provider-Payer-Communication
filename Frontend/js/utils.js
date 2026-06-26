/**
 * utils.js — Date/status formatting, color helpers, validation.
 */

// ─── Date Formatting ────────────────────────────────────────────────────────

export function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fmtDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── User Helpers ────────────────────────────────────────────────────────────

export function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─── Status Formatting ───────────────────────────────────────────────────────

const STATUS_MAP = {
  DRAFT: { cls: "badge-draft", icon: "✏️", label: "Draft" },
  AI_REVIEWED: { cls: "badge-ai", icon: "🤖", label: "AI Reviewed" },
  SUBMITTED: { cls: "badge-submitted", icon: "📤", label: "Submitted" },
  UNDER_REVIEW: { cls: "badge-submitted", icon: "🔍", label: "Under Review" },
  APPROVED: { cls: "badge-approved", icon: "✅", label: "Approved" },
  PARTIALLY_APPROVED: {
    cls: "badge-approved",
    icon: "⚡",
    label: "Partially Approved",
  },
  DENIED: { cls: "badge-denied", icon: "❌", label: "Denied" },
  PENDING_INFO: { cls: "badge-info", icon: "❓", label: "Info Required" },
  PENDING_REVIEW: { cls: "badge-pending", icon: "⏳", label: "Pending Review" },
  CANCELLED: { cls: "badge-draft", icon: "🚫", label: "Cancelled" },
  EXPIRED: { cls: "badge-draft", icon: "⌛", label: "Expired" },
};

export function statusBadgeHtml(status) {
  const { cls, icon, label } = STATUS_MAP[status] ?? {
    cls: "badge-draft",
    icon: "•",
    label: status,
  };
  return `<span class="badge ${cls}">${icon} ${label}</span>`;
}

export function statusLabel(status) {
  return STATUS_MAP[status]?.label ?? status;
}

// ─── Priority Formatting ─────────────────────────────────────────────────────

const PRIORITY_MAP = {
  STAT: "badge-stat",
  EMERGENT: "badge-emergent",
  URGENT: "badge-urgent",
  ROUTINE: "badge-routine",
};

export function priorityBadgeHtml(priority) {
  if (!priority) return "";
  const cls = PRIORITY_MAP[priority] ?? "badge-draft";
  return `<span class="badge ${cls}">${priority}</span>`;
}

// ─── Confidence Color ────────────────────────────────────────────────────────

export function confidenceColor(score) {
  if (score >= 80) return "#276749";
  if (score >= 60) return "#D69E2E";
  return "#9B2335";
}

// ─── Timeline Dot Class ──────────────────────────────────────────────────────

export function timelineDotClass(status) {
  if (status === "APPROVED" || status === "PARTIALLY_APPROVED")
    return "success";
  if (status === "DENIED") return "error";
  if (status === "AI_REVIEWED") return "ai";
  return "active";
}

// ─── Notification Icon ───────────────────────────────────────────────────────

export function notifIcon(type) {
  const icons = { AI_REVIEW: "🤖", DECISION: "⚖️", INFO_REQUEST: "❓" };
  return icons[type] ?? "🔔";
}

// ─── Validation Helpers ──────────────────────────────────────────────────────

export function isBlank(value) {
  return !value || String(value).trim() === "";
}

export function validateCreateRequest(data) {
  const errors = [];
  if (isBlank(data.patientName)) errors.push("Patient name is required");
  if (isBlank(data.patientMemberId))
    errors.push("Insurance member ID is required");
  if (!data.payerId) errors.push("Payer is required");
  if (isBlank(data.diagnosisCode))
    errors.push("ICD-10 diagnosis code is required");
  if (isBlank(data.procedureCode))
    errors.push("CPT procedure code is required");
  return errors;
}
