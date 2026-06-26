/**
 * dashboard.js — Dashboard rendering: stat cards, recent requests table.
 */

import { setState, getStateKey } from "./state.js";
import * as api from "./api.js";
import { setHtml, renderSpinner } from "./ui.js";
import { statusBadgeHtml, priorityBadgeHtml, fmtDate } from "./utils.js";
import { isProvider, isPayer } from "./auth.js";
import { navigate } from "./router.js";

/** Load all dashboard data and render the page. */
export async function renderDashboardPage() {
  const container = document.getElementById("page-content");
  if (!container) return;

  container.innerHTML = renderSpinner();

  try {
    const [stats, reqRes] = await Promise.all([
      api.fetchDashboardStats(),
      api.fetchRequests({ page: 0, size: 8 }),
    ]);
    setState({
      stats,
      requests: reqRes.content || [],
      totalRequests: reqRes.totalElements || 0,
    });
    container.innerHTML = buildDashboardHtml(stats, reqRes.content || []);
    attachDashboardEvents(container);
  } catch (e) {
    container.innerHTML = `<div class="alert alert-error">⚠️ Failed to load dashboard: ${e.message}</div>`;
  }
}

function buildDashboardHtml(stats, requests) {
  return `
${renderStatCards(stats)}
${renderPendingAlert(stats)}
<div class="card">
  <div class="card-header">
    <div>
      <div class="card-title">${isProvider() ? "Recent Requests" : "Pending Queue"}</div>
      <div class="card-subtitle">Latest authorization activity</div>
    </div>
    <button class="btn btn-secondary btn-sm" data-action="view-all">View All</button>
  </div>
  <div class="table-wrap">
    ${renderRecentTable(requests)}
  </div>
</div>`;
}

function renderStatCards(s) {
  const cards = isProvider()
    ? [
        {
          label: "Total Submitted",
          value: (s.pending || 0) + (s.approved || 0) + (s.denied || 0),
          icon: "📊",
          bg: "#EBF4FF",
        },
        {
          label: "Pending Decision",
          value: s.pending || 0,
          icon: "⏳",
          bg: "#FFFFF0",
        },
        {
          label: "Approved",
          value: s.approved || 0,
          icon: "✅",
          bg: "#F0FFF4",
        },
        {
          label: "Denied / Info",
          value: (s.denied || 0) + (s.pendingInfo || 0),
          icon: "⚠️",
          bg: "#FFF5F5",
        },
      ]
    : [
        { label: "In Queue", value: s.pending || 0, icon: "📥", bg: "#EBF4FF" },
        {
          label: "Approved",
          value: s.approved || 0,
          icon: "✅",
          bg: "#F0FFF4",
        },
        { label: "Denied", value: s.denied || 0, icon: "❌", bg: "#FFF5F5" },
        {
          label: "Need More Info",
          value: s.pendingInfo || 0,
          icon: "❓",
          bg: "#FFF8F0",
        },
      ];

  return `<div class="stats-grid">
    ${cards
      .map(
        (c) => `
    <div class="stat-card">
      <div class="stat-icon" style="background:${c.bg}">${c.icon}</div>
      <div>
        <div class="stat-value">${c.value}</div>
        <div class="stat-label">${c.label}</div>
      </div>
    </div>`,
      )
      .join("")}
  </div>`;
}

function renderPendingAlert(s) {
  if (!isProvider() || (!s.draft && !s.aiReviewed)) return "";
  return `
<div class="alert alert-info dashboard-pending-alert">
  📝 You have <strong>${s.draft || 0} draft</strong> and
  <strong>${s.aiReviewed || 0} AI-reviewed</strong> requests awaiting submission.
  <button class="btn btn-secondary btn-sm" data-action="view-all" style="margin-left:auto">View All</button>
</div>`;
}

function renderRecentTable(requests) {
  if (!requests.length) {
    const extra = isProvider()
      ? `<button class="btn btn-primary btn-sm" data-action="new-request">Create First Request</button>`
      : "";
    return `<div style="text-align:center;padding:32px;color:var(--text-muted)">No requests yet. ${extra}</div>`;
  }

  const partyHeader = isProvider() ? "<th>Payer</th>" : "<th>Provider</th>";

  return `<table>
    <thead>
      <tr>
        <th>Reference</th><th>Patient</th><th>Procedure</th>
        ${partyHeader}<th>Priority</th><th>Status</th><th>Date</th>
      </tr>
    </thead>
    <tbody>
      ${requests
        .map((r) => {
          const party = isProvider()
            ? r.payerName || "—"
            : r.providerName || "—";
          return `
        <tr class="clickable-row" data-request-id="${r.id}" style="cursor:pointer">
          <td><span class="ref-number">${r.referenceNumber}</span></td>
          <td>
            <div class="font-medium">${r.patientName}</div>
            <div class="text-muted text-sm">${r.patientMemberId || ""}</div>
          </td>
          <td>
            <div>${r.procedureCode || "—"}</div>
            <div class="text-muted text-sm">${(r.procedureDescription || "").slice(0, 30)}</div>
          </td>
          <td>${party}</td>
          <td>${priorityBadgeHtml(r.priority)}</td>
          <td>${statusBadgeHtml(r.status)}</td>
          <td class="text-muted">${fmtDate(r.createdAt)}</td>
        </tr>`;
        })
        .join("")}
    </tbody>
  </table>`;
}

function attachDashboardEvents(container) {
  // "View All" buttons
  container
    .querySelectorAll('[data-action="view-all"]')
    .forEach((btn) =>
      btn.addEventListener("click", () => navigate("requests")),
    );

  // "New Request" button
  container.querySelectorAll('[data-action="new-request"]').forEach((btn) =>
    btn.addEventListener("click", () => {
      setState({ showNewRequestModal: true });
      import("./authorization.js").then((m) => m.openNewRequestModal());
    }),
  );

  // Row clicks
  container.querySelectorAll(".clickable-row").forEach((row) =>
    row.addEventListener("click", () => {
      const id = parseInt(row.dataset.requestId);
      import("./authorization.js").then((m) => m.openRequestDetail(id));
    }),
  );
}
