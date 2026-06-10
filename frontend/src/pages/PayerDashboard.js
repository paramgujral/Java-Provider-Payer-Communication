import React, { useEffect, useState } from "react";
import PendingRequests from "../components/payer/PendingRequests";
import { getAllPayerRequests } from "../services/api";

const PAYER_ID = 1;

export default function PayerDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getAllPayerRequests(PAYER_ID);
      const reqs = res.data;
      setStats({
        total:    reqs.length,
        pending:  reqs.filter(r => r.status === "PENDING").length,
        approved: reqs.filter(r => r.status === "APPROVED").length,
        rejected: reqs.filter(r => r.status === "REJECTED").length,
      });
    } catch (err) {}
  };

  const statCards = [
    { label: "Total Received", value: stats.total,    color: "#1e40af", bg: "#eff6ff" },
    { label: "Awaiting Review", value: stats.pending, color: "#f59e0b", bg: "#fff8e1" },
    { label: "Approved",        value: stats.approved, color: "#22c55e", bg: "#f0fdf4" },
    { label: "Rejected",        value: stats.rejected, color: "#ef4444", bg: "#fef2f2" },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "960px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: 0, color: "#1e293b" }}>Payer Dashboard</h2>
        <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>
          HealthFirst Insurance · Authorization Review
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
        {statCards.map(({ label, value, color, bg }) => (
          <div key={label} style={{
            backgroundColor: bg, border: `1px solid ${color}22`,
            borderRadius: "10px", padding: "16px 20px",
          }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Requests list */}
      <div style={{
        backgroundColor: "white", borderRadius: "10px",
        padding: "24px", border: "1px solid #e2e8f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <PendingRequests payerId={PAYER_ID} />
      </div>
    </div>
  );
}