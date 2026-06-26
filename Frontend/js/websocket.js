/**
 * websocket.js — STOMP/SockJS WebSocket connection for real-time notifications.
 * Gracefully degrades if SockJS/STOMP scripts aren't loaded.
 */

import { setState, getStateKey } from "./state.js";
import { showToast } from "./ui.js";

const WS_URL = "http://localhost:8080/ws";
const RECONNECT_DELAY_MS = 5000;

let _stompClient = null;
let _reconnectTimer = null;

/** Connect to WebSocket using STOMP over SockJS. */
export function connectWebSocket() {
  // Guard: SockJS and STOMP must be loaded via <script> tags
  if (typeof SockJS === "undefined" || typeof Stomp === "undefined") {
    console.warn("[WS] SockJS or Stomp not loaded — skipping WebSocket.");
    return;
  }

  const user = getStateKey("user");
  if (!user) return;

  try {
    const socket = new SockJS(WS_URL);
    _stompClient = Stomp.over(socket);
    _stompClient.debug = null; // suppress verbose STOMP logs

    _stompClient.connect(
      { Authorization: `Bearer ${getStateKey("token")}` },
      () => _onConnected(user),
      (err) => _onError(err),
    );
  } catch (e) {
    console.warn("[WS] Connection failed:", e);
  }
}

function _onConnected(user) {
  console.info("[WS] Connected.");

  _stompClient.subscribe(
    `/user/${user.username}/queue/notifications`,
    (message) => _onNotification(message),
  );
}

function _onNotification(message) {
  try {
    const data = JSON.parse(message.body);

    // Increment unread count
    const current = getStateKey("unreadCount") || 0;
    setState({ unreadCount: current + 1 });

    // Update badge in sidebar if rendered
    const badge = document.querySelector(".nav-badge");
    if (badge) badge.textContent = getStateKey("unreadCount");

    // Add badge if it doesn't exist
    const notifNavItem = document.querySelector('[data-nav="notifications"]');
    if (notifNavItem && !badge) {
      const b = document.createElement("span");
      b.className = "nav-badge";
      b.textContent = "1";
      notifNavItem.appendChild(b);
    }

    showToast(`🔔 ${data.title}`, "info");
  } catch (e) {
    console.warn("[WS] Failed to parse notification:", e);
  }
}

function _onError(err) {
  console.warn("[WS] Error:", err);
  _scheduleReconnect();
}

function _scheduleReconnect() {
  clearTimeout(_reconnectTimer);
  _reconnectTimer = setTimeout(() => {
    console.info("[WS] Reconnecting…");
    connectWebSocket();
  }, RECONNECT_DELAY_MS);
}

/** Disconnect cleanly (call on logout). */
export function disconnectWebSocket() {
  clearTimeout(_reconnectTimer);
  if (_stompClient?.connected) {
    _stompClient.disconnect();
    _stompClient = null;
  }
}
