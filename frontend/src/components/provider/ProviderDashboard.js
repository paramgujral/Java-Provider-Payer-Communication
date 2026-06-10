import React, { useEffect, useState } from "react";
import SubmitRequestForm from "../components/provider/SubmitRequestForm";
import MyRequests from "../components/provider/MyRequests.js";
import { getProviderRequests, getNotifications, markAllRead } from "../services/api";

const PROVIDER_ID = 1;

export default function ProviderDashboard({ onUnreadCountChange }) {
  const [showForm, setShowForm] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchStats();
      fetchNotifications();
    }, 15000); // auto-refresh every 15s for tracking
    return () => clearInterval(interval);
  }, [refresh]);

  const fetchStats = async () => {
    try {
      const res = await getProviderRequests(PROVIDER_ID);
      const reqs = res.data;
      setStats({
        total:    reqs.length,
        pending:  reqs.filter(r => r.status === "PENDING").length,
        approved: reqs.filter(r => r.status === "APPROVED").length,
        rejected: reqs.filter(r => r.status === "REJECTED").length,
      });
    } catch (err) {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications(PROVIDER_ID);
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.isRead).length;
      if (onUnreadCountChange) onUnreadCountChange(unread);
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    await markAllRead(PROVIDER_ID);
    fetchNotifications();
  };

  const handleSubmitted = () => {
    setShowForm(false);
    setRefresh(r => r + 1);
  };

  const statCards = [
    { label: "Total",    value: stats.total,    color: "#1e40af", bg: "#eff6ff" },
    { label: "Pending",  value: stats.pending,  color: "#f59e0b", bg: "#fff8e1" },
    { label: "Approved", value: stats.approved, color: "#22c55e", bg: "#f0fdf4" },
    { label: "Rejected", value: stats.rejected, color: "#ef4444", bg: "#fef2f2" },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "960px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#1e293b" }}>Provider Dashboard</h2>
          <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>
            Dr. John Smith · Cardiology
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setShowNotifs(!showNotifs); handleMarkAllRead(); }}
              style={{
                padding: "8px 14px", borderRadius: "8px",
                border: "1px solid #e2e8f0", backgroundColor: "white",
                cursor: "pointer", fontSize: "13px",
              }}
            >
              🔔 Notifications {notifications.filter(n => !n.isRead).length > 0 &&
                <span style={{
                  backgroundColor: "#ef4444", color: "white",
                  borderRadius: "50%", padding: "1px 6px", fontSize: "11px", marginLeft: "4px",
                }}>
                  {notifications.filter(n => !n.isRead).length}
                </span>
              }
            </button>

            {showNotifs && (
              <div style={{
                position: "absolute", right: 0, top: "42px", width: "320px",
                backgroundColor: "white", border: "1px solid #e2e8f0",
                borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                zIndex: 100, maxHeight: "300px", overflowY: "auto",
              }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", fontWeight: 600, fontSize: "13px" }}>
                  Notifications
                </div>
                {notifications.length === 0 ? (
                  <p style={{ padding: "16px", color: "#94a3b8", fontSize: "13px", textAlign: "center" }}>No notifications</p>
                ) : notifications.map(n => (
                  <div key={n.id} style={{
                    padding: "10px 16px", borderBottom: "1px solid #f8fafc",
                    backgroundColor: n.isRead ? "white" : "#eff6ff",
                    fontSize: "13px", color: "#374151",
                  }}>
                    {n.message}
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "8px 18px", borderRadius: "8px",
              backgroundColor: "#1e40af", color: "white",
              border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: "14px",
            }}
          >
            {showForm ? "✕ Cancel" : "+ New Request"}
          </button>
        </div>
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

      {/* Submit form */}
      {showForm && (
        <div style={{
          backgroundColor: "white", borderRadius: "10px",
          padding: "24px", marginBottom: "24px",
          border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <SubmitRequestForm onSubmitted={handleSubmitted} />
        </div>
      )}

      {/* Requests table */}
      <div style={{
        backgroundColor: "white", borderRadius: "10px",
        padding: "24px", border: "1px solid #e2e8f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <MyRequests providerId={PROVIDER_ID} refresh={refresh} />
      </div>
    </div>
  );
}