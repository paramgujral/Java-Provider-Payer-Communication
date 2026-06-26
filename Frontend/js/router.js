/**
 * router.js — Hash-based navigation and view switching.
 */

import { setState, getStateKey } from "./state.js";

const _routes = {};
let _currentPage = null;

/** Register a route handler: router.on('dashboard', fn) */
export function on(page, handler) {
  _routes[page] = handler;
}

/** Navigate to a page, optionally with params merged into state. */
export async function navigate(page, stateParams = {}) {
  setState({ page, error: null, ...stateParams });
  _currentPage = page;
  window.location.hash = page;

  const handler = _routes[page];
  if (handler) await handler(stateParams);
}

/** Initialize router — reads current hash on load. */
export function initRouter(defaultPage = "dashboard") {
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace("#", "") || defaultPage;
    if (hash !== _currentPage) {
      navigate(hash);
    }
  });

  // Restore hash on page load
  const initial = window.location.hash.replace("#", "") || defaultPage;
  navigate(initial);
}

/** Returns the current page name. */
export function currentPage() {
  return getStateKey("page");
}
