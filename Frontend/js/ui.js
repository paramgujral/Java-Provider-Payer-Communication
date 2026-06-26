/**
 * ui.js — Reusable rendering utilities.
 * Toast, loaders, modal helpers, empty states, DOM helpers.
 */

// ─── DOM Helpers ─────────────────────────────────────────────────────────────

export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else node.setAttribute(k, v);
  }
  for (const child of children) {
    if (child == null) continue;
    node.append(
      typeof child === "string" ? document.createTextNode(child) : child,
    );
  }
  return node;
}

/** Replace innerHTML of a container, then return it. */
export function setHtml(container, html) {
  if (typeof container === "string") container = $(container);
  if (container) container.innerHTML = html;
  return container;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function ensureToastContainer() {
  let c = $("#toast-container");
  if (!c) {
    c = el("div", { id: "toast-container" });
    document.body.appendChild(c);
  }
  return c;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} duration ms
 */
export function showToast(message, type = "info", duration = 3500) {
  const container = ensureToastContainer();
  const toast = el("div", { class: `toast toast-${type}` }, message);
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, duration);
}

// ─── Loading State ────────────────────────────────────────────────────────────

export function renderSpinner(dark = true) {
  return `<div style="text-align:center;padding:40px">
    <div class="spinner ${dark ? "spinner-dark" : ""}" style="width:28px;height:28px;margin:auto"></div>
  </div>`;
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function renderEmptyState({
  icon = "📭",
  title = "Nothing here",
  subtitle = "",
} = {}) {
  return `
  <div class="empty-state">
    <div class="empty-state-icon">${icon}</div>
    <div class="empty-state-title">${title}</div>
    ${subtitle ? `<div class="text-muted">${subtitle}</div>` : ""}
  </div>`;
}

// ─── Alert Banner ─────────────────────────────────────────────────────────────

export function renderAlert(message, type = "info", dismissible = true) {
  return `
  <div class="alert alert-${type}">
    ⚠️ ${message}
    ${
      dismissible
        ? `<button onclick="this.parentElement.remove()"
      style="margin-left:auto;background:none;border:none;cursor:pointer;font-size:16px;">✕</button>`
        : ""
    }
  </div>`;
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

/**
 * Returns a Promise<boolean>. Resolves true on confirm, false on cancel.
 */
export function confirm(message) {
  return new Promise((resolve) => {
    const overlay = el("div", { class: "modal-overlay" });
    overlay.innerHTML = `
      <div class="modal modal-sm">
        <div class="modal-header">
          <div class="modal-title">Confirm</div>
        </div>
        <div class="modal-body">${message}</div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="confirm-cancel">Cancel</button>
          <button class="btn btn-danger" id="confirm-ok">Confirm</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector("#confirm-ok").addEventListener("click", () => {
      overlay.remove();
      resolve(true);
    });
    overlay.querySelector("#confirm-cancel").addEventListener("click", () => {
      overlay.remove();
      resolve(false);
    });
  });
}
