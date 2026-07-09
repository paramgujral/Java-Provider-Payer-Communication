import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const load = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (e) {
      // silent
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    await api.post('/notifications/read-all');
    load();
  };

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <button className="notif-btn" onClick={() => setOpen(!open)}>
        Notifications
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          {notifications.length === 0 && (
            <div className="notif-item">No notifications yet.</div>
          )}
          {notifications.map(n => (
            <div key={n.id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
              <div>{n.message}</div>
              <div className="time">{timeAgo(n.createdAt)}</div>
            </div>
          ))}
          {notifications.length > 0 && (
            <div className="notif-item">
              <button className="btn btn-secondary btn-sm" onClick={markAllRead}>Mark all as read</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Health<span className="accent">Connect</span></div>
        <nav>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
          {user?.role === 'PROVIDER' && (
            <NavLink to="/new-request" className={({ isActive }) => isActive ? 'active' : ''}>New Request</NavLink>
          )}
          <button onClick={handleLogout}>Sign out</button>
        </nav>
        <div className="user-block">
          <strong>{user?.fullName}</strong>
          {user?.organizationName} · {user?.role}
        </div>
      </aside>
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <NotificationBell />
        </div>
        {children}
      </main>
    </div>
  );
}
