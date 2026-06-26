/**
 * notification.js — Notification list, unread count, mark-read actions.
 */

import { setState, getStateKey } from "./state.js";
import * as api from "./api.js";
import { setHtml, showToast } from "./ui.js";
import { fmtDateTime, notifIcon } from "./utils.js";

/** Load and render the notifications page. */
export async function renderNotificationsPage() {
  const container = document.getElementById("page-content");
  if (!container) return;

  container.innerHTML = `<div class="card">
    <div class="card-header">
      <div><div class="card-title">🔔 Notifications</div></div>
      <button class="btn btn-secondary btn-sm" id="btn-mark-all-read">Mark All Read</button>
    </div>
    <div id="notif-list-inner">Loading…</div>
  </div>`;

  container
    .querySelector("#btn-mark-all-read")
    .addEventListener("click", handleMarkAllRead);

  await loadNotifications();
}

async function loadNotifications() {
  try {
    const res = await api.fetchNotifications();
    const notifications = res.content || [];
    setState({ notifications });
    renderNotificationList(notifications);
  } catch (e) {
    setHtml(
      "#notif-list-inner",
      `<div class="empty-state"><div>Failed to load notifications.</div></div>`,
    );
  }
}

function renderNotificationList(notifications) {
  if (!notifications.length) {
    setHtml(
      "#notif-list-inner",
      `
      <div class="empty-state">
        <div class="empty-state-icon">🔕</div>
        <div class="empty-state-title">All caught up</div>
        <div class="text-muted">No notifications</div>
      </div>`,
    );
    return;
  }

  setHtml(
    "#notif-list-inner",
    notifications.map(renderNotificationItem).join(""),
  );
}

function renderNotificationItem(n) {
  return `
<div class="notification-item ${!n.read ? "unread" : ""}" data-id="${n.id}">
  <div class="notification-icon">${notifIcon(n.type)}</div>
  <div style="flex:1">
    <div class="notification-title ${!n.read ? "unread" : ""}">${n.title}</div>
    <div class="notification-msg">${n.message}</div>
    <div class="notification-time">${fmtDateTime(n.createdAt)}</div>
  </div>
  ${!n.read ? '<span class="badge badge-submitted" style="flex-shrink:0">New</span>' : ""}
</div>`;
}

async function handleMarkAllRead() {
  try {
    await api.markAllRead();

    const updated = (getStateKey("notifications") || []).map((n) => ({
      ...n,
      read: true,
    }));
    setState({ unreadCount: 0, notifications: updated });

    updateSidebarBadge(0);

    const dot = document.getElementById("notif-dot");
    if (dot) dot.style.display = "none";

    renderNotificationList(updated);

    showToast("All notifications marked as read", "success");

    api
      .fetchNotifications()
      .then((res) => setState({ notifications: res.content || [] }))
      .catch(() => {}); // non-critical
  } catch (e) {
    showToast("Failed to mark notifications as read: " + e.message, "error");
  }
}

/** Update the unread badge in the sidebar nav. */
export function updateSidebarBadge(count) {
  const badge = document.querySelector('[data-nav="notifications"] .nav-badge');
  if (count > 0) {
    if (badge) {
      badge.textContent = count;
    } else {
      const navItem = document.querySelector('[data-nav="notifications"]');
      if (navItem) {
        const b = document.createElement("span");
        b.className = "nav-badge";
        b.textContent = count;
        navItem.appendChild(b);
      }
    }
  } else if (badge) {
    badge.remove();
  }
}

/** Fetch unread count and update sidebar. */
export async function refreshUnreadCount() {
  try {
    const res = await api.fetchUnreadCount();
    const count = res.count || 0;
    setState({ unreadCount: count });
    updateSidebarBadge(count);
    return count;
  } catch {
    return 0;
  }
}
