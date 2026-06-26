/**
 * auth.js — Authentication, JWT, session management.
 */

import { setState, getStateKey } from "./state.js";
import * as api from "./api.js";

const TOKEN_KEY = "hca_token";
const USER_KEY = "hca_user";

/** Persist session to localStorage. */
function persistSession(user, token) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setState({ user, token });
}

/** Load saved session from localStorage. Returns true if a session existed. */
export function loadSavedSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY);
  if (token && raw) {
    try {
      const user = JSON.parse(raw);
      setState({ user, token });
      return true;
    } catch {
      clearSession();
    }
  }
  return false;
}

/** Clear session from memory and localStorage. */
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  setState({ user: null, token: null });
}

/** Log in with username / password. Returns the user object. */
export async function doLogin(username, password) {
  const res = await api.login(username, password);
  persistSession(res, res.token);
  return res;
}

/** Register a new account. Returns the user object. */
export async function doRegister(data) {
  const res = await api.register(data);
  persistSession(res, res.token);
  return res;
}

/** Log out the current user. */
export function doLogout() {
  clearSession();
}

/** Returns the currently authenticated user or null. */
export function currentUser() {
  return getStateKey("user");
}

/** Returns true if the current user is a Provider. */
export function isProvider() {
  const user = currentUser();
  return user?.role === "PROVIDER";
}

/** Returns true if the current user is a Payer. */
export function isPayer() {
  const user = currentUser();
  return user?.role === "PAYER";
}
