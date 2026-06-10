import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── AI Copilot ───────────────────────────────────────────────────────────────
export const reviewRequest = (data) => api.post("/review", data);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const submitRequest = (data) => api.post("/provider/submit", data);
///requests/{providerId}
export const getProviderRequests = (providerId) => api.get(`/provider/requests/${providerId}`);
export const getProviders = () => api.get("/provider");

// ─── Payer ────────────────────────────────────────────────────────────────────
export const getPayers = () => api.get("/payer");
export const getAllPayerRequests = (payerId) => api.get(`/payer/requests/${payerId}`);
export const getPendingRequests = (payerId) => api.get(`/payer/${payerId}/requests/pending`);
export const updateRequestStatus = (requestId, data) =>
  api.put(`/payer/requests/${requestId}/status`, data);

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotifications = (providerId) => api.get(`/notifications/${providerId}`);
export const getUnreadCount = (providerId) => api.get(`/notifications/${providerId}/unread-count`);
export const markAllRead = (providerId) => api.put(`/notifications/${providerId}/read-all`);