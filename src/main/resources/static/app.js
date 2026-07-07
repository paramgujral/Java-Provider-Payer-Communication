const API = "/api";
let currentUser = null;
let currentRequestDraftId = null;
let pendingDecision = null; // { requestId, decision }
let payerFilter = "Pending";

// ---------- Utilities ----------
function $(id) { return document.getElementById(id); }
function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ---------- Login ----------
$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("login-error").textContent = "";
  const username = $("login-username").value.trim();
  const password = $("login-password").value;
  try {
    currentUser = await api("/login", { method: "POST", body: JSON.stringify({ username, password }) });
    enterApp();
  } catch (err) {
    $("login-error").textContent = err.message;
  }
});

function enterApp() {
  $("login-view").classList.add("hidden");
  $("app-view").classList.remove("hidden");
  $("user-badge").textContent = `${currentUser.name} · ${currentUser.role.toUpperCase()}`;

  if (currentUser.role === "provider") {
    $("provider-dashboard").classList.remove("hidden");
    loadProviderRequests();
  } else {
    $("payer-dashboard").classList.remove("hidden");
    loadPayerRequests();
  }
  loadNotifications();
  setInterval(loadNotifications, 8000);
}

$("logout-btn").addEventListener("click", () => {
  currentUser = null;
  location.reload();
});

// ---------- Notifications ----------
$("notif-btn").addEventListener("click", () => {
  $("notif-panel").classList.toggle("hidden");
});

async function loadNotifications() {
  if (!currentUser) return;
  const notes = await api(`/notifications?username=${encodeURIComponent(currentUser.username)}`);
  const unread = notes.filter((n) => !n.read).length;
  const countEl = $("notif-count");
  if (unread > 0) {
    countEl.textContent = unread;
    countEl.classList.remove("hidden");
  } else {
    countEl.classList.add("hidden");
  }
  const list = $("notif-list");
  list.innerHTML = notes.length
    ? notes.map((n) => `
        <div class="notif-item ${n.read ? "" : "unread"}" data-id="${n.id}">
          <div>${n.message}</div>
          <div class="notif-time">${timeAgo(n.createdAt)}</div>
        </div>`).join("")
    : `<div class="notif-item">No notifications yet.</div>`;

  list.querySelectorAll(".notif-item[data-id]").forEach((el) => {
    el.addEventListener("click", async () => {
      await api(`/notifications/${el.dataset.id}/read`, { method: "POST" });
      loadNotifications();
    });
  });
}

// ---------- Provider: New Request Form ----------
const requestForm = $("request-form");
const validateBtn = $("validate-btn");
const submitBtn = $("submit-btn");
const aiBox = $("ai-review-box");

function getFormData() {
  const payerSelect = $("f-payer");
  const selectedOpt = payerSelect.options[payerSelect.selectedIndex];
  return {
    patientName: $("f-patientName").value.trim(),
    dob: $("f-dob").value,
    procedureCode: $("f-procedureCode").value.trim(),
    diagnosisCode: $("f-diagnosisCode").value.trim(),
    provider: $("f-provider").value.trim(),
    providerUsername: currentUser.username,
    payer: selectedOpt.value,
    payerUsername: selectedOpt.dataset.username,
    urgency: $("f-urgency").value,
    notes: $("f-notes").value.trim(),
  };
}

validateBtn.addEventListener("click", async () => {
  validateBtn.textContent = "🤖 Reviewing...";
  validateBtn.disabled = true;
  try {
    // Create (or reuse) a draft request, then run AI Copilot validation on it
    if (!currentRequestDraftId) {
      const draft = await api("/requests", { method: "POST", body: JSON.stringify(getFormData()) });
      currentRequestDraftId = draft.id;
    } else {
      // Update draft fields isn't a separate endpoint in this minimal API,
      // so for simplicity we create a fresh draft each validation pass.
      const draft = await api("/requests", { method: "POST", body: JSON.stringify(getFormData()) });
      currentRequestDraftId = draft.id;
    }
    const review = await api(`/requests/${currentRequestDraftId}/validate`, { method: "POST" });
    renderAIReview(review);
    submitBtn.disabled = !review.isValid;
  } catch (err) {
    alert(err.message);
  } finally {
    validateBtn.textContent = "🤖 Run AI Copilot Review";
    validateBtn.disabled = false;
  }
});

function renderAIReview(review) {
  aiBox.classList.remove("hidden", "valid", "invalid");
  aiBox.classList.add(review.isValid ? "valid" : "invalid");
  aiBox.innerHTML = `
    <h4>${review.isValid ? "✅ AI Copilot: Looks good" : "⚠️ AI Copilot found issues"}</h4>
    <div>${review.summary}</div>
    ${review.issues.length ? `<ul>${review.issues.map((i) => `<li>${i}</li>`).join("")}</ul>` : ""}
    ${review.suggestions.length ? `<div style="margin-top:8px;"><strong>Suggestions:</strong><ul>${review.suggestions.map((s) => `<li>${s}</li>`).join("")}</ul></div>` : ""}
  `;
}

requestForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentRequestDraftId) return;
  try {
    await api(`/requests/${currentRequestDraftId}/submit`, { method: "POST" });
    alert("Request submitted to payer!");
    requestForm.reset();
    aiBox.classList.add("hidden");
    submitBtn.disabled = true;
    currentRequestDraftId = null;
    loadProviderRequests();
  } catch (err) {
    alert(err.message);
  }
});

// Reset AI validation state whenever the form is edited after a review
requestForm.addEventListener("input", () => {
  if (!aiBox.classList.contains("hidden")) {
    submitBtn.disabled = true;
    currentRequestDraftId = null;
  }
});

async function loadProviderRequests() {
  const requests = await api(`/requests?role=provider&username=${encodeURIComponent(currentUser.username)}`);
  const container = $("provider-requests");
  container.innerHTML = requests.length
    ? requests.map(requestItemHTML).join("")
    : `<div class="request-sub">No requests yet — create one above.</div>`;
}

function requestItemHTML(r) {
  return `
    <div class="request-item">
      <div class="request-main">
        <div class="request-title">${r.patientName} — CPT ${r.procedureCode} / ICD ${r.diagnosisCode}</div>
        <div class="request-sub">${r.urgency} · ${r.provider} → ${r.payer} · updated ${timeAgo(r.updatedAt)}</div>
      </div>
      <span class="status-pill status-${r.status}">${r.status}</span>
    </div>
  `;
}

// ---------- Payer Dashboard ----------
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    payerFilter = btn.dataset.status;
    loadPayerRequests();
  });
});

async function loadPayerRequests() {
  const requests = await api(`/requests?role=payer&username=${encodeURIComponent(currentUser.username)}`);
  const filtered = payerFilter === "All" ? requests : requests.filter((r) => r.status === payerFilter);
  const container = $("payer-requests");
  container.innerHTML = filtered.length
    ? filtered.map((r) => payerRequestItemHTML(r)).join("")
    : `<div class="request-sub">No ${payerFilter.toLowerCase()} requests.</div>`;

  container.querySelectorAll(".accept-btn").forEach((b) => b.addEventListener("click", () => openDecisionModal(b.dataset.id, "Accepted")));
  container.querySelectorAll(".reject-btn").forEach((b) => b.addEventListener("click", () => openDecisionModal(b.dataset.id, "Rejected")));
}

function payerRequestItemHTML(r) {
  const actions = r.status === "Pending"
    ? `<div class="request-actions">
         <button class="accept-btn" data-id="${r.id}">Accept</button>
         <button class="reject-btn" data-id="${r.id}">Reject</button>
       </div>`
    : `<span class="status-pill status-${r.status}">${r.status}</span>`;

  return `
    <div class="request-item">
      <div class="request-main">
        <div class="request-title">${r.patientName} — CPT ${r.procedureCode} / ICD ${r.diagnosisCode}</div>
        <div class="request-sub">${r.urgency} · from ${r.provider} · updated ${timeAgo(r.updatedAt)}</div>
        ${r.notes ? `<div class="request-sub">Notes: ${r.notes}</div>` : ""}
      </div>
      ${actions}
    </div>
  `;
}

// ---------- Decision modal ----------
function openDecisionModal(requestId, decision) {
  pendingDecision = { requestId, decision };
  $("decision-title").textContent = `${decision === "Accepted" ? "Accept" : "Reject"} Request`;
  $("decision-reason").value = "";
  $("decision-modal").classList.remove("hidden");
}
$("decision-cancel").addEventListener("click", () => {
  $("decision-modal").classList.add("hidden");
  pendingDecision = null;
});
$("decision-confirm").addEventListener("click", async () => {
  if (!pendingDecision) return;
  const reason = $("decision-reason").value.trim();
  try {
    await api(`/requests/${pendingDecision.requestId}/decision`, {
      method: "POST",
      body: JSON.stringify({ decision: pendingDecision.decision, reason }),
    });
    $("decision-modal").classList.add("hidden");
    pendingDecision = null;
    loadPayerRequests();
  } catch (err) {
    alert(err.message);
  }
});
