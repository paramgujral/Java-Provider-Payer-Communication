import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../AuthIntegration";

export default function DashboardPage({ onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loadDashboard = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="form-card">
      <div className="top-bar">
        <div>
          <h1>Dashboard</h1>
          <p>Authorization summary for payer review.</p>
          <></>
        </div>
        <div className="top-bar-actions">
          <button className="action-btn secondary-btn" onClick={() => navigate("/requests")}>Requests</button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      {errorMessage && <div className="message error">{errorMessage}</div>}

      {isLoading ? (
        <div className="message success">Loading dashboard...</div>
      ) : (
        <div className="dashboard-grid">
          {dashboard ? (
            Object.entries(dashboard).map(([key, value]) => (
              <div key={key} className="dashboard-card">
                <span className="dashboard-label">{key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}</span>
                <strong>{value}</strong>
              </div>
            ))
          ) : (
            <div className="message error">No dashboard data available.</div>
          )}
        </div>
      )}
    </div>
  );
}
