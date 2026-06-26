import type { User } from './types.js';

/** Fixed IDs so re-seeding never breaks browser sessions or claim links. */
export const DEMO_USERS: User[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    email: 'provider@cityhospital.com',
    name: 'Dr. Sarah Chen',
    role: 'provider',
    organization: 'City General Hospital',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    email: 'clinic@sunrise.com',
    name: 'Dr. James Wilson',
    role: 'provider',
    organization: 'Sunrise Medical Clinic',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222201',
    email: 'payer@healthguard.com',
    name: 'Michael Roberts',
    role: 'payer',
    organization: 'HealthGuard Insurance Co.',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    email: 'payer@careplus.com',
    name: 'Lisa Anderson',
    role: 'payer',
    organization: 'CarePlus Insurance',
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

export function getDemoUser(email: string): User | undefined {
  return DEMO_USERS.find((u) => u.email === email);
}
