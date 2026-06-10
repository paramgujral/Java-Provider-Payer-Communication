import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import SubmitPage from "./pages/SubmitPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import RequestsPage from "./pages/RequestsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import "./App.css";

function App() {
  const [role, setRole] = useState(null);

  const handleLogout = () => {
    setRole(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage setCurrentRole={setRole} />} />
        <Route
          path="/submit"
          element={role === "provider" ? <SubmitPage onLogout={handleLogout} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/notifications"
          element={role === "provider" ? <NotificationsPage onLogout={handleLogout} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/requests"
          element={role === "payer" ? <RequestsPage onLogout={handleLogout} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/dashboard"
          element={role === "payer" ? <DashboardPage onLogout={handleLogout} /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
