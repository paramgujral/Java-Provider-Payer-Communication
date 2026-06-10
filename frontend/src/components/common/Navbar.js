import React from "react";

export default function Navbar({ role, onRoleChange, unreadCount }) {
  return (
    <nav style={{
      backgroundColor: "#1e40af",
      color: "white",
      padding: "0 24px",
      height: "56px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "20px" }}>🏥</span>
        <span style={{ fontWeight: 700, fontSize: "16px" }}>HealthConnect</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Role toggle */}
        {["PROVIDER", "PAYER"].map((r) => (
          <button
            key={r}
            onClick={() => onRoleChange(r)}
            style={{
              padding: "6px 16px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              backgroundColor: role === r ? "white" : "transparent",
              color: role === r ? "#1e40af" : "rgba(255,255,255,0.75)",
              transition: "all 0.2s",
            }}
          >
            {r === "PROVIDER" ? "👨‍⚕️ Provider" : "🏦 Payer"}
          </button>
        ))}

        {/* Notification bell (provider only) */}
        {role === "PROVIDER" && (
          <div style={{ position: "relative", marginLeft: "8px" }}>
            <span style={{ fontSize: "20px", cursor: "pointer" }}>🔔</span>
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: "-4px", right: "-6px",
                backgroundColor: "#ef4444", color: "white",
                borderRadius: "50%", fontSize: "10px", fontWeight: 700,
                width: "16px", height: "16px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {unreadCount}
              </span>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}