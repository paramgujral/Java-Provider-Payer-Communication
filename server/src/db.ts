import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Claim, ClaimEvent, Notification, User } from './types.js';
import { buildDemoData } from './seed.js';
import { DEMO_USERS } from './demoUsers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'store.json');

interface Store {
  users: User[];
  claims: Claim[];
  claim_events: ClaimEvent[];
  notifications: Notification[];
}

let cache: Store | null = null;

function load(): Store {
  if (cache) return cache;
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    cache = { users: [], claims: [], claim_events: [], notifications: [] };
    save();
    return cache;
  }
  cache = JSON.parse(fs.readFileSync(dbPath, 'utf-8')) as Store;
  return cache;
}

function save() {
  if (!cache) return;
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(cache, null, 2));
}

export function clearCache() {
  cache = null;
}

export function initDatabase() {
  const store = load();
  if (store.users.length === 0) {
    store.users = DEMO_USERS.map((u) => ({ ...u }));
    save();
  }

  if (store.claims.length === 0) {
    const demo = buildDemoData(store.users);
    store.claims.push(...demo.claims);
    store.claim_events.push(...demo.events);
    store.notifications.push(...demo.notifications);
    save();
  }
}

export const store = {
  getUsers(role?: string): User[] {
    const s = load();
    let users = [...s.users];
    if (role) users = users.filter((u) => u.role === role);
    return users.sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));
  },

  getUserById(id: string): User | undefined {
    return load().users.find((u) => u.id === id);
  },

  getUserByEmail(email: string): User | undefined {
    return load().users.find((u) => u.email === email);
  },

  insertClaim(claim: Claim) {
    load().claims.push(claim);
    save();
  },

  updateClaim(id: string, updates: Partial<Claim>) {
    const s = load();
    const idx = s.claims.findIndex((c) => c.id === id);
    if (idx >= 0) {
      s.claims[idx] = { ...s.claims[idx], ...updates, updated_at: new Date().toISOString() };
      save();
    }
  },

  getClaimById(id: string): Claim | undefined {
    return load().claims.find((c) => c.id === id);
  },

  getClaimsByProvider(providerId: string): Claim[] {
    return load()
      .claims.filter((c) => c.provider_id === providerId)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  },

  getClaimsByPayer(payerId: string): Claim[] {
    const order: Record<string, number> = { submitted: 1, under_review: 2, revision_requested: 3 };
    return load()
      .claims.filter((c) => c.payer_id === payerId && c.status !== 'draft')
      .sort((a, b) => {
        const sa = order[a.status] ?? 4;
        const sb = order[b.status] ?? 4;
        if (sa !== sb) return sa - sb;
        return (b.submitted_at || '').localeCompare(a.submitted_at || '');
      });
  },

  getClaimsByField(field: 'provider_id' | 'payer_id', userId: string): Claim[] {
    return load()
      .claims.filter((c) => c[field] === userId)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  },

  getAllClaims(): Claim[] {
    return load().claims;
  },

  insertEvent(event: ClaimEvent) {
    load().claim_events.push(event);
    save();
  },

  getEventsByClaim(claimId: string): ClaimEvent[] {
    return load()
      .claim_events.filter((e) => e.claim_id === claimId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  },

  insertNotification(notification: Notification) {
    load().notifications.push(notification);
    save();
  },

  getNotifications(userId: string): Notification[] {
    return load()
      .notifications.filter((n) => n.user_id === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 50);
  },

  markNotificationRead(id: string, userId: string) {
    const n = load().notifications.find((x) => x.id === id && x.user_id === userId);
    if (n) {
      n.read = 1;
      save();
    }
  },

  markAllNotificationsRead(userId: string) {
    load().notifications.filter((n) => n.user_id === userId && n.read === 0).forEach((n) => (n.read = 1));
    save();
  },

  getUnreadCount(userId: string): number {
    return load().notifications.filter((n) => n.user_id === userId && n.read === 0).length;
  },
};
