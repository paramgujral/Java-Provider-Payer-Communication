/**
 * state.js — Global application state store.
 * No UI rendering. Pure data management.
 */

const _state = {
  // Auth
  user: null,
  token: null,

  // Navigation
  page: "dashboard",

  // Request list
  requests: [],
  totalRequests: 0,
  currentPage: 0,
  filterStatus: null,
  searchQuery: "",

  // Single request view
  currentRequest: null,
  statusHistory: [],

  // Notifications
  notifications: [],
  unreadCount: 0,

  // Dashboard
  stats: null,

  // Reference data
  payers: [],
  providers: [],

  // UI
  loading: false,
  error: null,

  // Modals
  showNewRequestModal: false,
  showDecisionModal: false,

  // AI
  aiReview: null,
  aiLoading: false,
};

/** Replace specific keys in state and return the new state. */
export function setState(partial) {
  Object.assign(_state, partial);
  return _state;
}

/** Read the entire state (frozen shallow copy). */
export function getState() {
  return Object.freeze({ ..._state });
}

/** Read a single key from state. */
export function getStateKey(key) {
  return _state[key];
}
