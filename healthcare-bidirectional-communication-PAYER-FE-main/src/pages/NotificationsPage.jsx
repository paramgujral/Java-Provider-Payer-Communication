import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllNotifications, getNotificationCount } from "../AuthIntegration";

export default function NotificationsPage({ onLogout }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const loadNotifications = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getAllNotifications();
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
      setErrorMessage("Unable to load notifications.");
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotificationCount = async () => {
    try {
      const response = await getNotificationCount();
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error(error);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadNotificationCount();
    loadNotifications();
  }, []);

  return (
    <div className="form-card">
      <div className="top-bar">
        <div>
          <h1>Notifications</h1>
          <p>Review provider notifications and unread alerts.</p>
        </div>
        <div className="top-bar-actions">
          <button className="action-btn secondary-btn" onClick={() => navigate("/submit")}>Back to Submit</button>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="notification-panel">
        <div className="notification-header">
          <h2>Unread notifications: {unreadCount}</h2>
        </div>

        {isLoading ? (
          <div className="message success">Loading notifications...</div>
        ) : errorMessage ? (
          <div className="message error">{errorMessage}</div>
        ) : notifications.length === 0 ? (
          <div className="message success">No notifications yet.</div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className={`notification-item ${notification.isRead === false || notification.isRead == null ? "unread" : ""}`}>
              <p>{notification.message || "Notification received."}</p>
              <div className="notification-meta">
                {notification.requestId != null && <small>Request ID: {notification.requestId}</small>}
                {notification.providerId != null && <small>Provider ID: {notification.providerId}</small>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
