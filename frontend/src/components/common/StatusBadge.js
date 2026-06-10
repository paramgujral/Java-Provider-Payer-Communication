import React from "react";

const colors = {
  PENDING:      { bg: "#fff8e1", color: "#f59e0b", label: "Pending" },
  APPROVED:     { bg: "#e8f5e9", color: "#22c55e", label: "Approved" },
  REJECTED:     { bg: "#fef2f2", color: "#ef4444", label: "Rejected" },
  UNDER_REVIEW: { bg: "#ede9fe", color: "#8b5cf6", label: "Under Review" },
  DRAFT:        { bg: "#f1f5f9", color: "#64748b", label: "Draft" },
  CANCELLED:    { bg: "#f1f5f9", color: "#94a3b8", label: "Cancelled" },
};

export default function StatusBadge({ status }) {
  const s = colors[status] || colors.DRAFT;
  return (
    <span style={{
      backgroundColor: s.bg,
      color: s.color,
      padding: "3px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: 600,
      border: `1px solid ${s.color}33`,
    }}>
      {s.label}
    </span>
  );
}