/**
 * authorization.js — Authorization list, detail, create, submit, payer decision.
 */

import { setState, getStateKey } from "./state.js";
import * as api from "./api.js";
import { setHtml, renderSpinner, renderEmptyState, showToast } from "./ui.js";
import {
  statusBadgeHtml,
  priorityBadgeHtml,
  fmtDate,
  fmtDateTime,
  confidenceColor,
  timelineDotClass,
  validateCreateRequest,
} from "./utils.js";
import { isProvider, isPayer } from "./auth.js";
import { renderAiPanel } from "./ai.js";
import { navigate } from "./router.js";

// ─── Request List ──────────────────────────────────────────────────────────

export async function renderRequestsPage() {
  const container = document.getElementById("page-content");
  if (!container) return;

  container.innerHTML = buildRequestsShell();
  attachRequestListEvents(container);
  await loadAndRenderRequests();
}

function buildRequestsShell() {
  const statuses = isProvider()
    ? [
        "DRAFT",
        "AI_REVIEWED",
        "SUBMITTED",
        "APPROVED",
        "DENIED",
        "PENDING_INFO",
      ]
    : ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "DENIED", "PENDING_INFO"];

  const chips = ["", ...statuses]
    .map((s) => {
      const active =
        getStateKey("filterStatus") === s ||
        (!s && !getStateKey("filterStatus"));
      return `<button class="filter-chip ${active ? "active" : ""}" data-status="${s}">
      ${s ? s.replace(/_/g, " ") : "All"}
    </button>`;
    })
    .join("");

  return `
<div class="filter-bar" id="filter-bar">
  ${chips}
  <div style="margin-left:auto;color:var(--text-muted);font-size:12px" id="request-count"></div>
</div>
<div class="card">
  <div class="table-wrap" id="requests-table-wrap">${renderSpinner()}</div>
  <div class="pager" id="requests-pager"></div>
</div>`;
}

async function loadAndRenderRequests() {
  const wrap = document.getElementById("requests-table-wrap");
  const pager = document.getElementById("requests-pager");
  if (!wrap) return;

  setState({ loading: true });
  wrap.innerHTML = renderSpinner();

  try {
    const res = await api.fetchRequests({
      page: getStateKey("currentPage"),
      size: 10,
      status: getStateKey("filterStatus") || undefined,
      q: getStateKey("searchQuery") || undefined,
    });

    setState({
      requests: res.content || [],
      totalRequests: res.totalElements || 0,
      loading: false,
    });
    document.getElementById("request-count").textContent =
      `${res.totalElements || 0} requests`;
    wrap.innerHTML = renderRequestsTable(res.content || []);
    pager.innerHTML = renderPager(
      getStateKey("currentPage"),
      res.totalElements || 0,
      10,
    );

    attachTableRowEvents(wrap);
    attachPagerEvents(pager);
  } catch (e) {
    wrap.innerHTML = `<div class="alert alert-error" style="margin:16px">⚠️ ${e.message}</div>`;
    setState({ loading: false });
  }
}

function renderRequestsTable(requests) {
  if (!requests.length)
    return renderEmptyState({
      icon: "📭",
      title: "No requests found",
      subtitle: "Try adjusting filters or create a new request",
    });

  return `<table>
    <thead>
      <tr>
        <th>Reference #</th><th>Patient</th><th>Diagnosis</th><th>Procedure</th>
        ${isProvider() ? "<th>Payer</th>" : "<th>Provider</th>"}
        <th>Priority</th><th>AI Score</th><th>Status</th><th>Submitted</th>
      </tr>
    </thead>
    <tbody>
      ${requests
        .map((r) => {
          const party = isProvider()
            ? r.payerName || "—"
            : `<div class="font-medium">${r.providerName || "—"}</div><div class="text-muted text-sm">${r.facilityName || ""}</div>`;

          const aiScore = r.aiReviewed
            ? `<div class="mini-conf-bar">
              <div class="mini-conf-track">
                <div class="mini-conf-fill" style="width:${r.aiConfidenceScore}%;background:${confidenceColor(r.aiConfidenceScore)}"></div>
              </div>
              <span style="font-size:12px;font-weight:600;color:${confidenceColor(r.aiConfidenceScore)}">${r.aiConfidenceScore}%</span>
             </div>`
            : '<span class="text-muted text-sm">—</span>';

          return `
        <tr class="clickable-row" data-request-id="${r.id}" style="cursor:pointer">
          <td><span class="ref-number">${r.referenceNumber}</span></td>
          <td>
            <div class="font-medium">${r.patientName}</div>
            <div class="text-muted text-sm">DOB: ${r.patientDob || "N/A"}</div>
          </td>
          <td><div class="font-mono">${r.diagnosisCode || "—"}</div><div class="text-muted text-sm">${(r.diagnosisDescription || "").slice(0, 24)}</div></td>
          <td><div class="font-mono">${r.procedureCode || "—"}</div><div class="text-muted text-sm">${(r.procedureDescription || "").slice(0, 24)}</div></td>
          <td>${party}</td>
          <td>${priorityBadgeHtml(r.priority)}</td>
          <td>${aiScore}</td>
          <td>${statusBadgeHtml(r.status)}</td>
          <td class="text-muted text-sm">${fmtDate(r.submittedAt || r.createdAt)}</td>
        </tr>`;
        })
        .join("")}
    </tbody>
  </table>`;
}

function renderPager(currentPage, total, size) {
  const totalPages = Math.ceil(total / size);
  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;
  return `
<span>${total} total</span>
<div class="pager-btns">
  <button class="pager-btn" data-page="${currentPage - 1}" ${!hasPrev ? "disabled" : ""}>← Prev</button>
  <button class="pager-btn active">${currentPage + 1}</button>
  <button class="pager-btn" data-page="${currentPage + 1}" ${!hasNext ? "disabled" : ""}>Next →</button>
</div>`;
}

function attachRequestListEvents(container) {
  container
    .querySelector("#filter-bar")
    .addEventListener("click", async (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      const status = chip.dataset.status || null;
      setState({ filterStatus: status || null, currentPage: 0 });
      container
        .querySelectorAll(".filter-chip")
        .forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      await loadAndRenderRequests();
    });
}

function attachTableRowEvents(wrap) {
  wrap
    .querySelectorAll(".clickable-row")
    .forEach((row) =>
      row.addEventListener("click", () =>
        openRequestDetail(parseInt(row.dataset.requestId)),
      ),
    );
}

function attachPagerEvents(pager) {
  pager.querySelectorAll(".pager-btn[data-page]").forEach((btn) => {
    const page = parseInt(btn.dataset.page);
    btn.addEventListener("click", async () => {
      setState({ currentPage: page });
      await loadAndRenderRequests();
    });
  });
}

// ─── Request Detail ────────────────────────────────────────────────────────

export async function openRequestDetail(id) {
  const container = document.getElementById("page-content");
  container.innerHTML = renderSpinner();
  navigate("request-detail");

  try {
    const [request, history] = await Promise.all([
      api.fetchRequest(id),
      api.fetchStatusHistory(id),
    ]);
    setState({
      currentRequest: request,
      statusHistory: history,
      aiReview: null,
    });
    container.innerHTML = buildDetailHtml(request, history);
    attachDetailEvents(container, request);
    updateTopBar("Request Detail", request.referenceNumber);
  } catch (e) {
    container.innerHTML = `<div class="alert alert-error">⚠️ ${e.message}</div>`;
  }
}

function buildDetailHtml(r, history) {
  const canSubmit =
    isProvider() && (r.status === "DRAFT" || r.status === "AI_REVIEWED");
  const canDecide =
    isPayer() && (r.status === "SUBMITTED" || r.status === "UNDER_REVIEW");

  return `
<div class="detail-actions">
  <button class="btn btn-secondary btn-sm" data-action="back">← Back</button>
  <span class="ref-number" style="font-size:14px">${r.referenceNumber}</span>
  ${statusBadgeHtml(r.status)}
  ${priorityBadgeHtml(r.priority)}
  <div class="detail-actions-right">
    ${isProvider() && r.status === "DRAFT" ? `<button class="btn btn-ai" data-action="ai-review">🤖 AI Copilot Review</button>` : ""}
    ${canSubmit ? `<button class="btn btn-primary" data-action="submit">📤 Submit to Payer</button>` : ""}
    ${canDecide ? `<button class="btn btn-success" data-action="decision">⚖️ Record Decision</button>` : ""}
  </div>
</div>

<div id="ai-panel-slot">${r.aiReviewed ? renderAiPanel(r) : ""}</div>

<div class="detail-layout">
  <div>
    ${buildClinicalCard(r)}
    ${r.payerDecision ? buildDecisionCard(r) : ""}
    ${r.fhirResourceId ? buildFhirCard(r) : ""}
  </div>
  <div>
    ${buildPartiesCard(r)}
    ${buildTimelineCard(history)}
    ${buildMetaCard(r)}
  </div>
</div>`;
}

function buildClinicalCard(r) {
  return `
<div class="card mb-4">
  <div class="card-header"><div class="card-title">👤 Patient &amp; Clinical Information</div></div>
  <div class="detail-card-inner">
    <div class="detail-section">
      <div class="detail-section-title">Patient</div>
      <div class="detail-grid">
        ${dItem("Name", r.patientName)}
        ${dItem("Date of Birth", r.patientDob)}
        ${dItem("Member ID", `<span class="font-mono">${r.patientMemberId || "—"}</span>`)}
        ${dItem("Insurance ID", `<span class="font-mono">${r.patientInsuranceId || "—"}</span>`)}
      </div>
    </div>
    <div class="detail-section">
      <div class="detail-section-title">Clinical</div>
      <div class="detail-grid">
        ${dItem("Diagnosis (ICD-10)", `<span class="font-mono">${r.diagnosisCode || "—"}</span> <span class="text-muted text-sm">${r.diagnosisDescription || ""}</span>`)}
        ${dItem("Procedure (CPT)", `<span class="font-mono">${r.procedureCode || "—"}</span> <span class="text-muted text-sm">${r.procedureDescription || ""}</span>`)}
        ${dItem("Service Type", r.serviceType)}
        ${dItem("Place of Service", r.placeOfService)}
        ${dItem("Requested Dates", `${fmtDate(r.requestedStartDate)} — ${fmtDate(r.requestedEndDate)}`)}
        ${dItem("Units Requested", r.numberOfUnits)}
      </div>
    </div>
    ${
      r.clinicalNotes
        ? `
    <div class="detail-section">
      <div class="detail-section-title">Clinical Notes</div>
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:12px;font-size:13px;line-height:1.6">${r.clinicalNotes}</div>
    </div>`
        : ""
    }
  </div>
</div>`;
}

function buildDecisionCard(r) {
  return `
<div class="card mb-4">
  <div class="card-header">
    <div class="card-title">⚖️ Payer Decision</div>
    ${statusBadgeHtml(r.status)}
  </div>
  <div class="decision-card">
    <div class="decision-grid">
      ${dItem("Decision", statusBadgeHtml(r.status))}
      ${dItem("Auth Number", `<span class="font-mono">${r.payerAuthorizationNumber || "—"}</span>`)}
      ${dItem("Approved Dates", r.approvedStartDate ? `${fmtDate(r.approvedStartDate)} — ${fmtDate(r.approvedEndDate)}` : "—")}
      ${dItem("Approved Units", r.approvedUnits)}
    </div>
    ${r.payerDecisionReason ? `<div style="margin-top:12px">${dItem("Reason", r.payerDecisionReason)}</div>` : ""}
    ${r.payerNotes ? `<div style="margin-top:12px">${dItem("Notes", r.payerNotes)}</div>` : ""}
  </div>
</div>`;
}

function buildFhirCard(r) {
  return `
<div class="card">
  <div class="card-header">
    <div class="card-title">🔗 FHIR R4 Bundle</div>
    <span class="badge badge-submitted">Da Vinci PAS IG</span>
  </div>
  <div style="padding:16px">
    <div class="fhir-code">// FHIR Resource ID: ${r.fhirResourceId}
// Bundle generated per Da Vinci Prior Authorization Support IG
// Claim.use = "preauthorization"
// Contains: Claim, Patient, Coverage resources
// Diagnosis coded in ICD-10-CM
// Procedure coded in CPT
// Provider identified by NPI

{ "resourceType": "Bundle", "id": "bundle-${r.referenceNumber}", "type": "collection", ... }</div>
  </div>
</div>`;
}

function buildPartiesCard(r) {
  return `
<div class="card mb-4">
  <div class="card-header"><div class="card-title">🏢 Parties</div></div>
  <div class="detail-parties">
    <div class="detail-party">
      <div class="detail-item-label">Provider</div>
      <div class="detail-item-value" style="margin-top:3px">${r.providerName || "—"}</div>
      <div class="text-muted text-sm">${r.facilityName || ""}</div>
      <div class="font-mono" style="color:var(--accent);margin-top:2px">NPI: ${r.providerNpi || "—"}</div>
    </div>
    <div class="detail-party">
      <div class="detail-item-label">Payer</div>
      <div class="detail-item-value" style="margin-top:3px">${r.payerName || "—"}</div>
      <div class="font-mono" style="color:var(--accent);margin-top:2px">${r.payerOrganizationId || "—"}</div>
    </div>
  </div>
</div>`;
}

function buildTimelineCard(history) {
  const items =
    history
      .map(
        (h) => `
    <div class="timeline-item">
      <div class="timeline-dot ${timelineDotClass(h.toStatus)}"></div>
      <div class="timeline-title">${(h.toStatus || "").replace(/_/g, " ")}</div>
      <div class="timeline-meta">${h.changedBy} · ${fmtDateTime(h.changedAt)}</div>
      ${h.changeReason ? `<div class="timeline-meta">${h.changeReason}</div>` : ""}
    </div>`,
      )
      .join("") || '<div class="text-muted text-sm">No history yet</div>';

  return `
<div class="card mb-4">
  <div class="card-header"><div class="card-title">⏱ Status Timeline</div></div>
  <div style="padding:16px"><div class="timeline">${items}</div></div>
</div>`;
}

function buildMetaCard(r) {
  return `
<div class="card">
  <div class="card-header"><div class="card-title">ℹ️ Metadata</div></div>
  <div class="detail-meta">
    <div class="detail-meta-row"><span class="text-muted">Created</span><span>${fmtDateTime(r.createdAt)}</span></div>
    <div class="detail-meta-row"><span class="text-muted">Updated</span><span>${fmtDateTime(r.updatedAt)}</span></div>
    <div class="detail-meta-row"><span class="text-muted">Submitted</span><span>${r.submittedAt ? fmtDateTime(r.submittedAt) : "—"}</span></div>
    <div class="detail-meta-row"><span class="text-muted">Decided</span><span>${r.decidedAt ? fmtDateTime(r.decidedAt) : "—"}</span></div>
    <div class="detail-meta-row"><span class="text-muted">Expires</span><span>${fmtDate(r.expiresAt)}</span></div>
    <div class="detail-meta-row"><span class="text-muted">Version</span><span>v${r.versionNumber || 1}</span></div>
  </div>
</div>`;
}

function attachDetailEvents(container, r) {
  container
    .querySelector('[data-action="back"]')
    ?.addEventListener("click", () => navigate("requests"));

  container
    .querySelector('[data-action="ai-review"]')
    ?.addEventListener("click", () => handleAiReview(r.id));

  container
    .querySelector('[data-action="submit"]')
    ?.addEventListener("click", () => handleSubmit(r.id));

  container
    .querySelector('[data-action="decision"]')
    ?.addEventListener("click", () => openDecisionModal(r));
}

async function handleAiReview(id) {
  const btn = document.querySelector('[data-action="ai-review"]');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Reviewing…';
  }

  try {
    const review = await api.runAiReview(id);
    setState({ aiReview: review });
    setHtml("#ai-panel-slot", renderAiPanel(review));
    showToast("AI review complete", "success");

    // Refresh full detail (status may have changed to AI_REVIEWED)
    const updated = await api.fetchRequest(id);
    setState({ currentRequest: updated });
    // Re-enable / remove button based on new status
    if (updated.status === "AI_REVIEWED") {
      btn?.remove();
    }
  } catch (e) {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "🤖 AI Copilot Review";
    }
    showToast("AI review failed: " + e.message, "error");
  }
}

async function handleSubmit(id) {
  const btn = document.querySelector('[data-action="submit"]');
  if (btn) btn.disabled = true;

  try {
    await api.submitRequest(id);
    showToast("Request submitted to payer", "success");
    await openRequestDetail(id);
  } catch (e) {
    if (btn) btn.disabled = false;
    showToast(e.message, "error");
  }
}

// ─── New Request Modal ─────────────────────────────────────────────────────

let _modalStep = 0;

export function openNewRequestModal() {
  _modalStep = 0;
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "new-request-overlay";
  overlay.innerHTML = buildNewRequestModalHtml();
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  overlay
    .querySelector("#modal-close")
    .addEventListener("click", () => overlay.remove());
  overlay
    .querySelector("#modal-close-2")
    .addEventListener("click", () => overlay.remove());
  overlay
    .querySelector("#modal-next")
    .addEventListener("click", () => advanceModalStep(overlay));
  overlay
    .querySelector("#modal-back")
    .addEventListener("click", () => regressModalStep(overlay));
}

function buildNewRequestModalHtml() {
  const payers = getStateKey("payers") || [];

  return `
<div class="modal">
  <div class="modal-header">
    <div class="modal-title">New Prior Authorization Request</div>
    <button class="btn-close" id="modal-close">✕</button>
  </div>
  <div class="modal-body">
    <div id="modal-error"></div>
    <div class="tabs">
      <button class="tab active" id="tab-patient">Patient</button>
      <button class="tab" id="tab-clinical">Clinical</button>
      <button class="tab" id="tab-docs">Documents</button>
    </div>

    <div id="panel-patient">
      <div class="form-grid form-grid-2">
        <div class="form-group"><label>Patient Full Name *</label>
          <input class="form-control" id="nrq-patientName" placeholder="John Smith"/></div>
        <div class="form-group"><label>Date of Birth</label>
          <input class="form-control" id="nrq-patientDob" type="date"/></div>
        <div class="form-group"><label>Insurance Member ID *</label>
          <input class="form-control" id="nrq-memberId" placeholder="MBR-123456"/></div>
        <div class="form-group"><label>Insurance Plan ID</label>
          <input class="form-control" id="nrq-insuranceId" placeholder="PLAN-001"/></div>
      </div>
      <div class="form-group" style="margin-top:14px"><label>Payer *</label>
        <select class="form-control" id="nrq-payerId">
          <option value="">Select payer organization…</option>
          ${payers.map((p) => `<option value="${p.id}">${p.organizationName} (${p.organizationId})</option>`).join("")}
        </select>
      </div>
    </div>

    <div id="panel-clinical" style="display:none">
      <div class="form-grid form-grid-2">
        <div class="form-group"><label>ICD-10 Diagnosis Code *</label>
          <input class="form-control" id="nrq-diagCode" placeholder="M54.50"/>
          <span class="form-hint">e.g. M54.50 (Low back pain)</span></div>
        <div class="form-group"><label>Diagnosis Description</label>
          <input class="form-control" id="nrq-diagDesc" placeholder="Low back pain, unspecified"/></div>
        <div class="form-group"><label>CPT Procedure Code *</label>
          <input class="form-control" id="nrq-procCode" placeholder="27447"/>
          <span class="form-hint">e.g. 27447 (Total knee arthroplasty)</span></div>
        <div class="form-group"><label>Procedure Description</label>
          <input class="form-control" id="nrq-procDesc" placeholder="Total knee arthroplasty"/></div>
        <div class="form-group"><label>Service Type</label>
          <input class="form-control" id="nrq-serviceType" placeholder="Inpatient Surgery"/></div>
        <div class="form-group"><label>Place of Service</label>
          <select class="form-control" id="nrq-pos">
            <option value="21">21 - Inpatient Hospital</option>
            <option value="22">22 - Outpatient Hospital</option>
            <option value="11">11 - Office</option>
            <option value="23">23 - Emergency Room</option>
            <option value="31">31 - Skilled Nursing Facility</option>
          </select></div>
        <div class="form-group"><label>Service Start Date</label>
          <input class="form-control" id="nrq-startDate" type="date"/></div>
        <div class="form-group"><label>Service End Date</label>
          <input class="form-control" id="nrq-endDate" type="date"/></div>
        <div class="form-group"><label>Units / Sessions</label>
          <input class="form-control" id="nrq-units" type="number" placeholder="1" min="1"/></div>
        <div class="form-group"><label>Priority</label>
          <select class="form-control" id="nrq-priority">
            <option value="ROUTINE">Routine</option>
            <option value="URGENT">Urgent</option>
            <option value="EMERGENT">Emergent</option>
            <option value="STAT">STAT</option>
          </select></div>
      </div>
      <div class="form-group" style="margin-top:14px"><label>Clinical Notes / Medical Necessity</label>
        <textarea class="form-control" id="nrq-notes" placeholder="Describe medical necessity…"></textarea>
      </div>
    </div>

    <div id="panel-docs" style="display:none">
      <div class="alert alert-info">
        📎 In production, documents would be uploaded and attached as FHIR Binary/DocumentReference resources.
      </div>
      <div class="form-group"><label>Supporting Document URLs</label>
        <textarea class="form-control" id="nrq-docUrls"
          placeholder="https://docs.example.com/note.pdf&#10;https://docs.example.com/imaging.pdf"
          style="min-height:100px"></textarea>
        <span class="form-hint">One URL per line</span>
      </div>
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-secondary" id="modal-close-2">Cancel</button>
    <button class="btn btn-secondary" id="modal-back" disabled>← Back</button>
    <button class="btn btn-primary" id="modal-next">Next → Patient Info</button>
  </div>
</div>`;
}

const STEPS = ["patient", "clinical", "docs"];
const NEXT_LABELS = [
  "Next → Clinical Info",
  "Next → Documents",
  "Submit Request",
];

function advanceModalStep(overlay) {
  if (_modalStep < 2) {
    overlay.querySelector(`#panel-${STEPS[_modalStep]}`).style.display = "none";
    _modalStep++;
    overlay.querySelector(`#panel-${STEPS[_modalStep]}`).style.display = "";
    overlay.querySelector("#modal-next").textContent = NEXT_LABELS[_modalStep];
    overlay.querySelector("#modal-back").disabled = false;
    updateTabActive(overlay);
  } else {
    handleCreateRequest(overlay);
  }
}

function regressModalStep(overlay) {
  if (_modalStep > 0) {
    overlay.querySelector(`#panel-${STEPS[_modalStep]}`).style.display = "none";
    _modalStep--;
    overlay.querySelector(`#panel-${STEPS[_modalStep]}`).style.display = "";
    overlay.querySelector("#modal-next").textContent = NEXT_LABELS[_modalStep];
    overlay.querySelector("#modal-back").disabled = _modalStep === 0;
    updateTabActive(overlay);
  }
}

function updateTabActive(overlay) {
  overlay
    .querySelectorAll(".tab")
    .forEach((t, i) => t.classList.toggle("active", i === _modalStep));
}

async function handleCreateRequest(overlay) {
  const g = (id) => overlay.querySelector(`#${id}`)?.value || "";
  const docUrls = g("nrq-docUrls")
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean);

  const data = {
    patientName: g("nrq-patientName"),
    patientDob: g("nrq-patientDob"),
    patientMemberId: g("nrq-memberId"),
    patientInsuranceId: g("nrq-insuranceId"),
    payerId: parseInt(g("nrq-payerId")) || null,
    diagnosisCode: g("nrq-diagCode"),
    diagnosisDescription: g("nrq-diagDesc"),
    procedureCode: g("nrq-procCode"),
    procedureDescription: g("nrq-procDesc"),
    serviceType: g("nrq-serviceType"),
    placeOfService: g("nrq-pos"),
    requestedStartDate: g("nrq-startDate") || null,
    requestedEndDate: g("nrq-endDate") || null,
    numberOfUnits: parseInt(g("nrq-units")) || 1,
    priority: g("nrq-priority"),
    clinicalNotes: g("nrq-notes"),
    documentUrls: docUrls,
  };

  const errors = validateCreateRequest(data);
  if (errors.length) {
    setHtml(
      "#modal-error",
      `<div class="alert alert-error">⚠️ ${errors.join(" · ")}</div>`,
    );
    // Jump back to first panel with issues
    _modalStep = 0;
    STEPS.forEach((s, i) => {
      overlay.querySelector(`#panel-${s}`).style.display =
        i === 0 ? "" : "none";
    });
    updateTabActive(overlay);
    return;
  }

  const submitBtn = overlay.querySelector("#modal-next");
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Creating…';

  try {
    const created = await api.createRequest(data);
    overlay.remove();
    showToast("Authorization request created", "success");
    setState({ currentRequest: created });
    await openRequestDetail(created.id);
  } catch (e) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Request";
    setHtml(
      "#modal-error",
      `<div class="alert alert-error">⚠️ ${e.message}</div>`,
    );
  }
}

// ─── Payer Decision Modal ──────────────────────────────────────────────────

function openDecisionModal(r) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = buildDecisionModalHtml(r);
  document.body.appendChild(overlay);

  overlay
    .querySelector("#dec-close")
    .addEventListener("click", () => overlay.remove());
  overlay
    .querySelector("#dec-close-2")
    .addEventListener("click", () => overlay.remove());
  overlay
    .querySelector("#dec-submit")
    .addEventListener("click", () => handleDecisionSubmit(overlay, r.id));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

function buildDecisionModalHtml(r) {
  return `
<div class="modal modal-sm">
  <div class="modal-header">
    <div class="modal-title">⚖️ Record Authorization Decision</div>
    <button class="btn-close" id="dec-close">✕</button>
  </div>
  <div class="modal-body">
    <div class="alert alert-info" style="margin-bottom:16px">
      Reviewing: <strong>${r.referenceNumber}</strong> for <strong>${r.patientName}</strong>
      (${r.procedureCode} — ${r.procedureDescription})
    </div>
    <div class="form-grid">
      <div class="form-group"><label>Decision *</label>
        <select class="form-control" id="dec-status">
          <option value="APPROVED">✅ Approved</option>
          <option value="PARTIALLY_APPROVED">⚡ Partially Approved</option>
          <option value="DENIED">❌ Denied</option>
          <option value="PENDING_INFO">❓ Request Additional Information</option>
        </select></div>
      <div class="form-group"><label>Authorization Number</label>
        <input class="form-control" id="dec-authNum" placeholder="AUTH-2024-XXXXX"/></div>
      <div class="form-group"><label>Decision Reason</label>
        <input class="form-control" id="dec-reason" placeholder="Medically necessary per clinical guidelines"/></div>
      <div class="form-group"><label>Notes to Provider</label>
        <textarea class="form-control" id="dec-notes" placeholder="Additional instructions…"></textarea></div>
      <div class="form-grid form-grid-2">
        <div class="form-group"><label>Approved Start Date</label>
          <input class="form-control" id="dec-startDate" type="date"/></div>
        <div class="form-group"><label>Approved End Date</label>
          <input class="form-control" id="dec-endDate" type="date"/></div>
      </div>
      <div class="form-group"><label>Approved Units</label>
        <input class="form-control" id="dec-units" type="number" placeholder="1"/></div>
    </div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-secondary" id="dec-close-2">Cancel</button>
    <button class="btn btn-success" id="dec-submit">Submit Decision</button>
  </div>
</div>`;
}

async function handleDecisionSubmit(overlay, requestId) {
  const g = (id) => overlay.querySelector(`#${id}`)?.value || "";
  const data = {
    decision: g("dec-status"),
    authorizationNumber: g("dec-authNum"),
    decisionReason: g("dec-reason"),
    notes: g("dec-notes"),
    approvedStartDate: g("dec-startDate") || null,
    approvedEndDate: g("dec-endDate") || null,
    approvedUnits: parseInt(g("dec-units")) || null,
  };

  const btn = overlay.querySelector("#dec-submit");
  btn.disabled = true;
  btn.textContent = "Submitting…";

  try {
    await api.recordDecision(requestId, data);
    overlay.remove();
    showToast("Decision recorded successfully", "success");
    await openRequestDetail(requestId);
  } catch (e) {
    btn.disabled = false;
    btn.textContent = "Submit Decision";
    showToast(e.message, "error");
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function dItem(label, value) {
  return `<div>
    <div class="detail-item-label">${label}</div>
    <div class="detail-item-value">${value ?? "—"}</div>
  </div>`;
}

function updateTopBar(title, subtitle = "") {
  const t = document.querySelector(".page-title");
  const s = document.querySelector(".page-subtitle");
  if (t) t.textContent = title;
  if (s) s.textContent = subtitle;
}
