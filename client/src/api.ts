import type {
  AIValidationResult,
  AiEngineStatus,
  Claim,
  ClaimEvent,
  ClaimFormData,
  DashboardStats,
  Notification,
  PayerReviewResult,
  User,
} from './types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  login: (email: string) => request<{ user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email }) }),
  getAiStatus: () => request<AiEngineStatus>('/ai/status'),
  getUsers: (role?: string) => request<User[]>(`/users${role ? `?role=${role}` : ''}`),
  validateClaim: (data: ClaimFormData) =>
    request<AIValidationResult>('/ai/validate', { method: 'POST', body: JSON.stringify(data) }),
  reviewClaim: (data: ClaimFormData) =>
    request<PayerReviewResult>('/ai/review', { method: 'POST', body: JSON.stringify(data) }),
  getProviderClaims: (providerId: string) => request<Claim[]>(`/claims/provider/${providerId}`),
  getPayerClaims: (payerId: string) => request<Claim[]>(`/claims/payer/${payerId}`),
  getClaim: (id: string) => request<Claim>(`/claims/${id}`),
  getFhirBundle: (id: string) => request<Record<string, unknown>>(`/claims/${id}/fhir/bundle`),
  getClaimEvents: (id: string) => request<ClaimEvent[]>(`/claims/${id}/events`),
  createClaim: (providerId: string, data: ClaimFormData) =>
    request<Claim>('/claims', { method: 'POST', body: JSON.stringify({ providerId, ...data }) }),
  updateClaim: (id: string, providerId: string, data: ClaimFormData) =>
    request<Claim>(`/claims/${id}`, { method: 'PUT', body: JSON.stringify({ providerId, ...data }) }),
  submitClaim: (id: string, providerId: string) =>
    request<Claim>(`/claims/${id}/submit`, { method: 'POST', body: JSON.stringify({ providerId }) }),
  reviewClaimAction: (
    id: string,
    payerId: string,
    action: string,
    notes?: string,
    applyCorrections?: boolean
  ) =>
    request<Claim>(`/claims/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ payerId, action, notes, applyCorrections }),
    }),
  getDashboard: (userId: string) => request<DashboardStats>(`/dashboard/${userId}`),
  getNotifications: (userId: string) => request<Notification[]>(`/notifications/${userId}`),
  getUnreadCount: (userId: string) => request<{ count: number }>(`/notifications/${userId}/unread-count`),
  markNotificationRead: (id: string, userId: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    }),
  markAllRead: (userId: string) =>
    request<{ success: boolean }>(`/notifications/${userId}/read-all`, { method: 'PATCH' }),
};
