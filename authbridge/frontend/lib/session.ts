"use client";

import type { Role, Session } from "./types";

// Demo session handling. In production this is replaced by OAuth2/OIDC: an
// access token in an httpOnly cookie and role claims read server-side. Here we
// keep a lightweight client session in localStorage so the demo needs no IdP.

const KEY = "authbridge.session";

export interface DemoCredential {
  email: string;
  password: string;
  session: Session;
}

// Dummy credentials — shown on the login screen so anyone can sign in instantly.
export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    email: "provider@authbridge.health",
    password: "demo1234",
    session: { role: "PROVIDER", name: "Dr. Alan Grant", org: "Riverside General Hospital" },
  },
  {
    email: "payer@authbridge.health",
    password: "demo1234",
    session: { role: "PAYER", name: "P. Sattler", org: "Meridian Health Plan" },
  },
];

export const DEMO_USERS: Record<Role, Session> = {
  PROVIDER: DEMO_CREDENTIALS[0].session,
  PAYER: DEMO_CREDENTIALS[1].session,
};

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

/** Dummy credential check. Returns the session on success, null otherwise. */
export function login(email: string, password: string): Session | null {
  const match = DEMO_CREDENTIALS.find(
    (c) => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password,
  );
  if (!match) return null;
  localStorage.setItem(KEY, JSON.stringify(match.session));
  return match.session;
}

/** Used by the quick "fill demo credentials" buttons / role presets. */
export function setSession(role: Role): Session {
  const s = DEMO_USERS[role];
  localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}

export function clearSession(): void {
  localStorage.removeItem(KEY);
}
