/**
 * api.js — All backend communication.
 * No DOM manipulation. Returns plain data or throws Error.
 */

import { getStateKey } from "./state.js";

export const API_BASE = "http://localhost:8080/api";

/** Core fetch wrapper. Attaches JWT if present. */
async function request(path, options = {}) {
  const token = getStateKey("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { headers, ...options });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export const login = (username, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const register = (data) =>
  request("/auth/register", { method: "POST", body: JSON.stringify(data) });

export const fetchPayers = () => request("/authorizations/payers");

export const fetchProviders = () => request("/authorizations/providers");

// ─── Authorization Requests ────────────────────────────────────────────────

export const fetchRequests = ({ page = 0, size = 10, status, q } = {}) => {
  let url = `/authorizations?page=${page}&size=${size}`;
  if (status) url += `&status=${status}`;
  if (q) url += `&q=${encodeURIComponent(q)}`;
  return request(url);
};

export const fetchRequest = (id) => request(`/authorizations/${id}`);

export const createRequest = (data) =>
  request("/authorizations", { method: "POST", body: JSON.stringify(data) });

export const submitRequest = (id) =>
  request(`/authorizations/${id}/submit`, { method: "POST" });

export const recordDecision = (id, data) =>
  request(`/authorizations/${id}/decision`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const fetchStatusHistory = (id) =>
  request(`/authorizations/${id}/history`);

export const fetchDashboardStats = () =>
  request("/authorizations/dashboard/stats");

// ─── AI ────────────────────────────────────────────────────────────────────

export const runAiReview = (id) =>
  request(`/authorizations/${id}/ai-review`, { method: "POST" });

// ─── Notifications ─────────────────────────────────────────────────────────

export const fetchNotifications = (page = 0, size = 50) =>
  request(`/notifications?page=${page}&size=${size}`);

export const fetchUnreadNotifications = () => request("/notifications/unread");

export const fetchUnreadCount = () => request("/notifications/unread/count");

export const markAllRead = async () => {
  const token = getStateKey("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // intentionally no res.json() — endpoint returns empty body
};

export const markNotificationRead = (id) =>
  request(`/notifications/${id}/read`, { method: "POST" });
