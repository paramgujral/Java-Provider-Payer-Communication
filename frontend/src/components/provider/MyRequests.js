import React, { useEffect, useState } from "react";
import { getProviderRequests } from "../../services/api";
import StatusBadge from "../common/StatusBadge";

export default function MyRequests({ providerId, refresh }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [providerId, refresh]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getProviderRequests(providerId);
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loading requests...</p>;
  if (requests.length === 0) return (
    <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", padding: "40px 0" }}>
      No requests submitted yet.
    </p>
  );

  return (
    <div>
      <h3 style={{ margin: "0 0 14px", color: "#1e293b", fontSize: "16px" }}>My Requests</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc" }}>
              {["#", "Patient", "Diagnosis", "Procedure", "Payer", "AI Review", "Status", "Date"].map(h => (
                <th key={h} style={{
                  padding: "10px 12px", textAlign: "left",
                  borderBottom: "1px solid #e2e8f0",
                  color: "#64748b", fontWeight: 600, whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((req, idx) => (
              <tr key={req.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <td style={{ padding: "10px 12px", color: "#94a3b8" }}>{idx + 1}</td>
                <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1e293b" }}>{req.patientName}</td>
                <td style={{ padding: "10px 12px", color: "#475569" }}>{req.diagnosis}</td>
                <td style={{ padding: "10px 12px", color: "#475569" }}>{req.procedureName}</td>
                <td style={{ padding: "10px 12px", color: "#475569" }}>{req.payerName}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{
                    fontSize: "12px", fontWeight: 600,
                    color: req.aiReviewPassed ? "#15803d" : "#dc2626",
                  }}>
                    {req.aiReviewPassed ? "✅ Passed" : "❌ Failed"}
                  </span>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <StatusBadge status={req.status} />
                </td>
                <td style={{ padding: "10px 12px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payer remarks for rejected */}
      {requests.filter(r => r.status === "REJECTED" && r.payerRemarks).map(req => (
        <div key={req.id} style={{
          marginTop: "12px", padding: "10px 14px",
          backgroundColor: "#fef2f2", border: "1px solid #fca5a5",
          borderRadius: "6px", fontSize: "13px",
        }}>
          <strong style={{ color: "#dc2626" }}>Request #{req.id} rejected:</strong>{" "}
          <span style={{ color: "#7f1d1d" }}>{req.payerRemarks}</span>
        </div>
      ))}
    </div>
  );
}