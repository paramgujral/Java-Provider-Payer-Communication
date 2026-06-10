import React, { useState } from "react";
import { updateRequestStatus } from "../../services/api";
import StatusBadge from "../common/StatusBadge";

export default function RequestCard({ request, payerId, onUpdated }) {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(null); // "APPROVED" | "REJECTED"
  const [expanded, setExpanded] = useState(false);

  const handleAction = async (status) => {
    setLoading(status);
    try {
      await updateRequestStatus(request.id, { status, remarks, payerId });
      if (onUpdated) onUpdated();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(null);
    }
  };

  const isPending = request.status === "PENDING" || request.status === "UNDER_REVIEW";

  return (
    <div style={{
      border: "1px solid #e2e8f0", borderRadius: "10px",
      padding: "16px", backgroundColor: "white",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>{request.patientName}</span>
            <StatusBadge status={request.status} />
          </div>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
            #{request.id} · {request.providerName} · {new Date(request.createdAt).toLocaleDateString()}
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "none", border: "1px solid #e2e8f0",
            borderRadius: "6px", padding: "4px 10px",
            cursor: "pointer", fontSize: "12px", color: "#64748b",
          }}
        >
          {expanded ? "Less ▲" : "Details ▼"}
        </button>
      </div>

      {/* Key info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
        {[
          ["Diagnosis", request.diagnosis],
          ["Procedure", request.procedureName],
          ["Service Dates", `${request.serviceStartDate || "—"} → ${request.serviceEndDate || "—"}`],
          ["AI Review", request.aiReviewPassed ? "✅ Passed" : "❌ Failed"],
        ].map(([label, value]) => (
          <div key={label}>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, display: "block" }}>{label}</span>
            <span style={{ fontSize: "13px", color: "#374151" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          marginTop: "12px", padding: "12px",
          backgroundColor: "#f8fafc", borderRadius: "6px",
          fontSize: "13px", color: "#475569",
        }}>
          <strong>Clinical Notes:</strong>
          <p style={{ margin: "4px 0 8px" }}>{request.clinicalNotes || "None provided"}</p>
          {request.aiReviewNotes && (
            <>
              <strong>AI Review Notes:</strong>
              <p style={{ margin: "4px 0 0" }}>{request.aiReviewNotes}</p>
            </>
          )}
        </div>
      )}

      {/* Action area — only for pending */}
      {isPending && (
        <div style={{ marginTop: "14px", borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
          <input
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add remarks (optional)..."
            style={{
              width: "100%", padding: "8px 12px", borderRadius: "6px",
              border: "1px solid #d1d5db", fontSize: "13px",
              boxSizing: "border-box", marginBottom: "10px",
            }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => handleAction("APPROVED")}
              disabled={!!loading}
              style={{
                flex: 1, padding: "9px", borderRadius: "6px", border: "none",
                backgroundColor: "#22c55e", color: "white",
                fontWeight: 600, fontSize: "13px", cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading === "APPROVED" ? "Approving..." : "✓ Approve"}
            </button>
            <button
              onClick={() => handleAction("REJECTED")}
              disabled={!!loading}
              style={{
                flex: 1, padding: "9px", borderRadius: "6px", border: "none",
                backgroundColor: "#ef4444", color: "white",
                fontWeight: 600, fontSize: "13px", cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading === "REJECTED" ? "Rejecting..." : "✗ Reject"}
            </button>
          </div>
        </div>
      )}

      {/* Finalized remarks */}
      {!isPending && request.payerRemarks && (
        <div style={{
          marginTop: "10px", padding: "8px 12px",
          backgroundColor: request.status === "APPROVED" ? "#f0fdf4" : "#fef2f2",
          borderRadius: "6px", fontSize: "13px",
          color: request.status === "APPROVED" ? "#15803d" : "#dc2626",
        }}>
          <strong>Remarks:</strong> {request.payerRemarks}
        </div>
      )}
    </div>
  );
}