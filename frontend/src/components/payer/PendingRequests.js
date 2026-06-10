import React, { useEffect, useState } from "react";
import { getAllPayerRequests } from "../../services/api";
import RequestCard from "./RequestCard";

export default function PendingRequests({ payerId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");

  useEffect(() => {
    fetchRequests();
  }, [payerId]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getAllPayerRequests(payerId);
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch payer requests", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === "ALL"
    ? requests
    : requests.filter((r) => r.status === filter);

  const countByStatus = (s) => requests.filter((r) => r.status === s).length;

  const tabs = [
    { key: "PENDING",  label: `Pending (${countByStatus("PENDING")})` },
    { key: "APPROVED", label: `Approved (${countByStatus("APPROVED")})` },
    { key: "REJECTED", label: `Rejected (${countByStatus("REJECTED")})` },
    { key: "ALL",      label: `All (${requests.length})` },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0, color: "#1e293b", fontSize: "16px" }}>Authorization Requests</h3>
        <button
          onClick={fetchRequests}
          style={{
            padding: "6px 14px", borderRadius: "6px",
            border: "1px solid #e2e8f0", backgroundColor: "white",
            cursor: "pointer", fontSize: "13px", color: "#475569",
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "16px", borderBottom: "1px solid #e2e8f0" }}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: "8px 14px", border: "none", cursor: "pointer",
              backgroundColor: "transparent", fontSize: "13px", fontWeight: 600,
              color: filter === key ? "#1e40af" : "#94a3b8",
              borderBottom: filter === key ? "2px solid #1e40af" : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loading requests...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", padding: "40px 0" }}>
          No {filter.toLowerCase()} requests.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              payerId={payerId}
              onUpdated={fetchRequests}
            />
          ))}
        </div>
      )}
    </div>
  );
}