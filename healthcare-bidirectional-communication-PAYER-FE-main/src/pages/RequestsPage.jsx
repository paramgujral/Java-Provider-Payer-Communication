import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAuthorizations, approveAuthorization, rejectAuthorization } from "../AuthIntegration";

export default function RequestsPage({ onLogout }) {
  const [requests, setRequests] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectComment, setRejectComment] = useState("");

  const loadRequests = async () => {
    try {
      const response = await getAllAuthorizations();
      setRequests(response.data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to load requests.");
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const approveRequest = async (id) => {
    try {
      await approveAuthorization(id);
      setStatusMessage("Request approved.");
      setErrorMessage("");
      setRejectTarget(null);
      setRejectComment("");
      await loadRequests();
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to approve request.");
    }
  };

  const openRejectForm = (item) => {
    setRejectTarget(item);
    setRejectComment("");
    setErrorMessage("");
    setStatusMessage("");
  };

  const cancelReject = () => {
    setRejectTarget(null);
    setRejectComment("");
  };

  const rejectRequest = async () => {
    if (!rejectComment.trim()) {
      setErrorMessage("Please enter a reason for rejection.");
      return;
    }

    try {
      await rejectAuthorization(rejectTarget.id, rejectComment.trim());
      setStatusMessage("Request rejected.");
      setErrorMessage("");
      setRejectTarget(null);
      setRejectComment("");
      await loadRequests();
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to reject request.");
    }
  };

  const navigate = useNavigate();

  return (
    <div className="form-card">
      <div className="top-bar">
        <div>
          <h1>Payer Requests</h1>
          <p>Review pending authorization requests and take action.</p>
        </div>
        <div className="top-bar-actions">
          <button className="action-btn secondary-btn" type="button" onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {statusMessage && <div className="message success">{statusMessage}</div>}
      {errorMessage && <div className="message error">{errorMessage}</div>}

      {rejectTarget && (
        <div className="reject-panel">
          <h2>Reject request #{rejectTarget.id}</h2>
          <p>Provide a reason before sending the rejection.</p>
          <textarea
            className="form-input reject-textarea"
            name="rejectComment"
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            placeholder="Enter rejection reason"
            rows={4}
          />
          <div className="reject-action-row">
            <button type="button" className="action-btn reject-btn" onClick={rejectRequest}>
              Send Reject
            </button>
            <button type="button" className="action-btn cancel-btn" onClick={cancelReject}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="request-table-section">
        <div className="table-wrapper">
          <table className="request-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Patient</th>
                <th>Disease</th>
                <th>Treatment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    No authorization requests available.
                  </td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.patientName}</td>
                    <td>{item.disease}</td>
                    <td>{item.treatment}</td>
                    <td>{item.status}</td>
                    <td>
                      <button
                        type="button"
                        className="action-btn approve-btn"
                        onClick={() => approveRequest(item.id)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="action-btn reject-btn"
                        onClick={() => openRejectForm(item)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
