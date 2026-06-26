/**
 * app.js — Application bootstrap and shell rendering.
 * Initializes auth, router, WebSocket, and renders the app or auth screen.
 */

import { getStateKey, setState } from "./state.js";
import {
  loadSavedSession,
  doLogin,
  doRegister,
  doLogout,
  currentUser,
  isProvider,
} from "./auth.js";
import * as api from "./api.js";
import { navigate, on as onRoute, initRouter } from "./router.js";
import { connectWebSocket, disconnectWebSocket } from "./websocket.js";
import { showToast, $ } from "./ui.js";
import { initials } from "./utils.js";
import { renderDashboardPage } from "./dashboard.js";
import { renderRequestsPage, openNewRequestModal } from "./authorization.js";
import { renderNotificationsPage, refreshUnreadCount } from "./notification.js";

// ─── Boot ─────────────────────────────────────────────────────────────────────
let _authTab = "login";
let _regRole = "PROVIDER";

(async function boot() {
  const hasSession = loadSavedSession();

  if (hasSession) {
    await loadReferenceData();
    renderAppShell();
    registerRoutes();
    await refreshUnreadCount();
    connectWebSocket();
    initRouter("dashboard");
  } else {
    renderAuthPage("login");
  }
})();

// ─── Reference Data ────────────────────────────────────────────────────────────

async function loadReferenceData() {
  try {
    const payers = await api.fetchPayers();
    setState({ payers });
  } catch {
    /* non-critical */
  }
}

// ─── App Shell ─────────────────────────────────────────────────────────────────

function renderAppShell() {
  document.body.innerHTML = `
<div class="app">
  ${buildSidebar()}
  <div class="main-content">
    ${buildTopBar()}
    <div class="page-content" id="page-content"></div>
  </div>
</div>
<div id="toast-container"></div>`;

  attachShellEvents();
}

function buildSidebar() {
  const user = currentUser();
  const providerLinks = `
    <div class="nav-section-label">Workflow</div>
    <div class="nav-item" data-nav="dashboard"><span class="nav-icon">📊</span> Dashboard</div>
    <div class="nav-item" data-nav="requests"><span class="nav-icon">📋</span> My Requests</div>
    <div class="nav-section-label">Tools</div>
    <div class="nav-item" data-nav="new-request"><span class="nav-icon">➕</span> New Request</div>`;

  const payerLinks = `
    <div class="nav-section-label">Workflow</div>
    <div class="nav-item" data-nav="dashboard"><span class="nav-icon">📊</span> Dashboard</div>
    <div class="nav-item" data-nav="requests"><span class="nav-icon">📋</span> Requests Queue</div>`;

  const unread = getStateKey("unreadCount") || 0;

  return `
<div class="sidebar">
  <div class="sidebar-brand">
    <div class="brand-logo">
      <div class="brand-icon">🏥</div>
      <div>
        <div class="brand-name">Smart Healthcare</div>
        <div class="brand-tag">Connector</div>
      </div>
    </div>
  </div>
  <div class="sidebar-nav">
    ${isProvider() ? providerLinks : payerLinks}
    <div class="nav-section-label">Account</div>
    <div class="nav-item" data-nav="notifications">
      <span class="nav-icon">🔔</span> Notifications
      ${unread > 0 ? `<span class="nav-badge">${unread}</span>` : ""}
    </div>
  </div>
  <div class="sidebar-footer">
    <div class="user-info">
      <div class="user-avatar">${initials(user?.fullName)}</div>
      <div>
        <div class="user-name">${user?.fullName || ""}</div>
        <div class="user-role">${user?.organizationName || user?.role || ""}</div>
      </div>
      <button class="btn-logout" id="btn-logout" title="Sign out">↩</button>
    </div>
  </div>
</div>`;
}

function buildTopBar() {
  return `
<div class="top-bar">
  <div>
    <div class="page-title" id="topbar-title">Dashboard</div>
    <div class="page-subtitle" id="topbar-subtitle">${isProvider() ? "Provider Portal" : "Payer Portal"}</div>
  </div>
  <div class="top-bar-right" id="topbar-right">
    <div class="search-bar" id="search-bar" style="display:none">
      🔍 <input id="search-input" placeholder="Search requests…" />
    </div>
    <button class="icon-btn" data-nav="notifications" title="Notifications" id="notif-icon-btn">
      🔔 <span id="notif-dot" style="display:none" class="notif-dot"></span>
    </button>
    ${isProvider() ? `<button class="btn btn-primary btn-sm" id="btn-new-request">+ New Request</button>` : ""}
  </div>
</div>`;
}

function attachShellEvents() {
  // Sidebar nav
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", () => {
      const target = el.dataset.nav;
      if (target === "new-request") {
        openNewRequestModal();
      } else {
        navigate(target);
      }
    });
  });

  // Logout
  document
    .getElementById("btn-logout")
    ?.addEventListener("click", handleLogout);

  // New request (top bar)
  document
    .getElementById("btn-new-request")
    ?.addEventListener("click", openNewRequestModal);

  // Notification icon
  document
    .getElementById("notif-icon-btn")
    ?.addEventListener("click", () => navigate("notifications"));

  // Search
  document
    .getElementById("search-input")
    ?.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        setState({ searchQuery: e.target.value, currentPage: 0 });
        const { renderRequestsPage } = await import("./authorization.js");
        await renderRequestsPage();
      }
    });
}

// ─── Routes ────────────────────────────────────────────────────────────────────

function registerRoutes() {
  onRoute("dashboard", async () => {
    setTopBar("Dashboard", isProvider() ? "Provider Portal" : "Payer Portal");
    setActiveNav("dashboard");
    showSearchBar(false);
    await renderDashboardPage();
  });

  onRoute("requests", async () => {
    const label = isProvider() ? "Authorization Requests" : "Requests Queue";
    setTopBar(label, "");
    setActiveNav("requests");
    showSearchBar(true);
    await renderRequestsPage();
  });

  onRoute("request-detail", () => {
    setActiveNav("requests");
    showSearchBar(false);
    // detail is rendered by authorization.js directly
  });

  onRoute("notifications", async () => {
    setTopBar("Notifications", `${getStateKey("unreadCount") || 0} unread`);
    setActiveNav("notifications");
    showSearchBar(false);
    await renderNotificationsPage();
  });
}

function setTopBar(title, subtitle) {
  const t = document.getElementById("topbar-title");
  const s = document.getElementById("topbar-subtitle");
  if (t) t.textContent = title;
  if (s) s.textContent = subtitle;
}

function setActiveNav(page) {
  document.querySelectorAll(".nav-item[data-nav]").forEach((el) => {
    el.classList.toggle("active", el.dataset.nav === page);
  });
}

function showSearchBar(visible) {
  const bar = document.getElementById("search-bar");
  if (bar) bar.style.display = visible ? "flex" : "none";
}

// ─── Logout ────────────────────────────────────────────────────────────────────

function handleLogout() {
  disconnectWebSocket();
  doLogout();
  renderAuthPage("login");
}

// ─── Auth Page ─────────────────────────────────────────────────────────────────

function renderAuthPage(tab = "login") {
  _authTab = tab;
  document.body.innerHTML = buildAuthHtml(tab);
  attachAuthEvents();
}

function buildAuthHtml(tab) {
  return `
<div class="auth-page">
  <div class="auth-card">
    <div class="auth-logo">
      <div class="auth-logo-icon">🏥</div>
      <div class="auth-title">Smart Healthcare</div>
      <div class="auth-subtitle">Connector</div>
    </div>
    <div id="auth-error"></div>
    <div class="auth-tabs">
      <button class="auth-tab ${tab === "login" ? "active" : ""}" data-auth-tab="login">Sign In</button>
      <button class="auth-tab ${tab === "register" ? "active" : ""}" data-auth-tab="register">Register</button>
    </div>
    <div id="auth-form">${tab === "login" ? buildLoginForm() : buildRegisterForm()}</div>
    <div class="demo-accounts">
      <div class="demo-accounts-label">DEMO ACCOUNTS</div>
      <div class="demo-grid">
        <button class="btn btn-secondary btn-sm" data-demo="provider1">🩺 Dr. Rama Rao (NIMS)</button>
        <button class="btn btn-secondary btn-sm" data-demo="payer1">🏦 Aarogyasri (Telangana)</button>
      </div>
    </div>
  </div>
</div>
<div id="toast-container"></div>`;
}

function buildLoginForm() {
  return `
<div class="form-grid">
  <div class="form-group"><label>Username</label>
    <input class="form-control" id="login-username" placeholder="Enter username"/></div>
  <div class="form-group"><label>Password</label>
    <input class="form-control" id="login-password" type="password" placeholder="Enter password"/></div>
  <button class="btn btn-primary btn-lg" style="width:100%" id="btn-login">Sign In →</button>
</div>`;
}

function buildRegisterForm() {
  return `
<div class="form-grid">
  <div class="role-selector">
    <div class="role-option ${_regRole === "PROVIDER" ? "selected" : ""}" data-role="PROVIDER">
      <div class="role-option-icon">🩺</div>
      <div class="role-option-label">Provider</div>
    </div>
    <div class="role-option ${_regRole === "PAYER" ? "selected" : ""}" data-role="PAYER">
      <div class="role-option-icon">🏦</div>
      <div class="role-option-label">Payer</div>
    </div>
  </div>
  <div class="form-grid form-grid-2">
    <div class="form-group"><label>Full Name</label>
      <input class="form-control" id="reg-fullname" placeholder="Dr. Jane Smith"/></div>
    <div class="form-group"><label>Email</label>
      <input class="form-control" id="reg-email" type="email" placeholder="jane@hospital.com"/></div>
  </div>
  <div class="form-grid form-grid-2">
    <div class="form-group"><label>Username</label>
      <input class="form-control" id="reg-username" placeholder="janesmith"/></div>
    <div class="form-group"><label>Password</label>
      <input class="form-control" id="reg-password" type="password" placeholder="Min 8 characters"/></div>
  </div>
  <div class="form-grid form-grid-2">
    <div class="form-group"><label id="org-id-label">${_regRole === "PROVIDER" ? "NPI Number" : "Payer ID"}</label>
      <input class="form-control" id="reg-orgid" placeholder="${_regRole === "PROVIDER" ? "1234567890" : "PAYER-001"}"/></div>
    <div class="form-group"><label>Organization Name</label>
      <input class="form-control" id="reg-orgname" placeholder="City Medical Center"/></div>
  </div>
  <button class="btn btn-primary btn-lg" style="width:100%" id="btn-register">Create Account →</button>
</div>`;
}

function attachAuthEvents() {
  // Tab switching
  document.querySelectorAll("[data-auth-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      _authTab = btn.dataset.authTab;
      document
        .querySelectorAll("[data-auth-tab]")
        .forEach((b) =>
          b.classList.toggle("active", b.dataset.authTab === _authTab),
        );
      document.getElementById("auth-form").innerHTML =
        _authTab === "login" ? buildLoginForm() : buildRegisterForm();
      attachAuthFormEvents();
    });
  });

  attachAuthFormEvents();

  // Demo quick-login buttons
  document.querySelectorAll("[data-demo]").forEach((btn) => {
    btn.addEventListener("click", () => quickLogin(btn.dataset.demo));
  });
}

function attachAuthFormEvents() {
  document.getElementById("btn-login")?.addEventListener("click", handleLogin);
  document
    .getElementById("btn-register")
    ?.addEventListener("click", handleRegister);

  // Enter key on login password
  document
    .getElementById("login-password")
    ?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleLogin();
    });

  // Role selector
  document.querySelectorAll("[data-role]").forEach((opt) => {
    opt.addEventListener("click", () => {
      _regRole = opt.dataset.role;
      document
        .querySelectorAll("[data-role]")
        .forEach((o) =>
          o.classList.toggle("selected", o.dataset.role === _regRole),
        );
      const orgLabel = document.getElementById("org-id-label");
      if (orgLabel)
        orgLabel.textContent =
          _regRole === "PROVIDER" ? "NPI Number" : "Payer ID";
    });
  });
}

async function handleLogin() {
  const username = document.getElementById("login-username")?.value?.trim();
  const password = document.getElementById("login-password")?.value;
  if (!username || !password) {
    showAuthError("Please enter your username and password.");
    return;
  }
  const btn = document.getElementById("btn-login");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Signing in…';

  try {
    await doLogin(username, password);
    await loadReferenceData();
    renderAppShell();
    registerRoutes();
    await refreshUnreadCount();
    connectWebSocket();
    initRouter("dashboard");
  } catch (e) {
    btn.disabled = false;
    btn.textContent = "Sign In →";
    showAuthError(friendlyAuthError(e));
  }
}

async function handleRegister() {
  const g = (id) => document.getElementById(id)?.value?.trim() || "";
  const data = {
    fullName: g("reg-fullname"),
    email: g("reg-email"),
    username: g("reg-username"),
    password: document.getElementById("reg-password")?.value,
    role: _regRole,
    organizationId: g("reg-orgid"),
    organizationName: g("reg-orgname"),
  };

  const btn = document.getElementById("btn-register");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Creating account…';

  try {
    await doRegister(data);
    await loadReferenceData();
    renderAppShell();
    registerRoutes();
    await refreshUnreadCount();
    connectWebSocket();
    initRouter("dashboard");
  } catch (e) {
    btn.disabled = false;
    btn.textContent = "Create Account →";

    const msg = (e.message || "").toLowerCase();
    if (msg.includes("username already")) {
      showAuthError("That username is already taken. Please choose another.");
    } else if (msg.includes("email already")) {
      showAuthError(
        "An account with that email already exists. Try signing in instead.",
      );
    } else if (
      msg.includes("failed to fetch") ||
      msg.includes("networkerror")
    ) {
      showAuthError(
        "Cannot reach the server. Please make sure the backend is running.",
      );
    } else {
      showAuthError(
        "Registration failed. Please check your details and try again.",
      );
    }
  }
}

async function quickLogin(username) {
  const btn = document.querySelector(`[data-demo="${username}"]`);
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner spinner-dark"></span>';
  }
  try {
    await doLogin(username, "password");
    await loadReferenceData();
    renderAppShell();
    registerRoutes();
    await refreshUnreadCount();
    connectWebSocket();
    initRouter("dashboard");
  } catch (e) {
    if (btn) {
      btn.disabled = false;
      btn.textContent =
        username === "provider1"
          ? "🩺 Dr. Rama Rao (NIMS)"
          : "🏦 Aarogyasri (Telangana)";
    }
    showAuthError(
      "Backend not reachable. Start the Spring Boot server at localhost:8080.",
    );
  }
}

function showAuthError(msg) {
  const el = document.getElementById("auth-error");
  if (el) el.innerHTML = `<div class="alert alert-error">⚠️ ${msg}</div>`;
}

function friendlyAuthError(e) {
  const msg = (e.message || "").toLowerCase();

  if (
    msg.includes("401") ||
    msg.includes("unauthorized") ||
    msg.includes("bad credentials")
  ) {
    return "Incorrect username or password. Please try again.";
  }
  if (msg.includes("403") || msg.includes("forbidden")) {
    return "Your account does not have access. Please contact your administrator.";
  }
  if (msg.includes("404")) {
    return "Account not found. Please check your username or register.";
  }
  if (msg.includes("423") || msg.includes("locked")) {
    return "Your account has been locked. Please contact support.";
  }
  if (msg.includes("429") || msg.includes("too many")) {
    return "Too many login attempts. Please wait a few minutes and try again.";
  }
  if (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("err_connection")
  ) {
    return "Cannot reach the server. Please make sure the backend is running.";
  }

  // Fallback
  return "Login failed. Please check your credentials and try again.";
}
