import React, { useState } from "react";
import Navbar from "./components/common/Navbar";
import ProviderDashboard from "./pages/ProviderDashboard";
import PayerDashboard from "./pages/PayerDashboard";

export default function App() {
  const [role, setRole] = useState("PROVIDER");
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Navbar role={role} onRoleChange={setRole} unreadCount={unreadCount} />
      {role === "PROVIDER"
        ? <ProviderDashboard onUnreadCountChange={setUnreadCount} />
        : <PayerDashboard />
      }
    </div>
  );
}