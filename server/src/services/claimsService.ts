import { randomUUID } from 'crypto';
import { store } from '../db.js';
import {
  generateAuthNumber,
  toFhirBundle,
  toFhirClaimResponse,
} from '../fhir/mappers.js';
import type { Claim, ClaimEvent, ClaimFormData, ClaimStatus, DashboardStats, Notification, User } from '../types.js';
import { reviewClaimForPayerRules, validateClaimFormRules } from './aiCopilot.js';

export function getUsers(role?: string): User[] {
  return store.getUsers(role);
}

export function getUserById(id: string): User | undefined {
  return store.getUserById(id);
}

export function loginUser(email: string): User | undefined {
  return store.getUserByEmail(email);
}

export function createClaim(providerId: string, data: ClaimFormData): Claim {
  const id = randomUUID();
  const validation = validateClaimFormRules(data);
  const now = new Date().toISOString();

  const claim: Claim = {
    id,
    provider_id: providerId,
    payer_id: data.payer_id || null,
    status: 'draft',
    patient_name: data.patient_name || '',
    patient_id: data.patient_id || '',
    patient_dob: data.patient_dob || '',
    patient_gender: data.patient_gender || '',
    insurance_policy_number: data.insurance_policy_number || '',
    diagnosis_code: data.diagnosis_code || '',
    diagnosis_description: data.diagnosis_description || '',
    procedure_code: data.procedure_code || '',
    procedure_description: data.procedure_description || '',
    claim_amount: data.claim_amount || 0,
    service_date: data.service_date || '',
    provider_notes: data.provider_notes || '',
    payer_notes: null,
    corrected_fields: null,
    auth_number: null,
    fhir_claim_response: null,
    ai_score: validation.score,
    created_at: now,
    updated_at: now,
    submitted_at: null,
    reviewed_at: null,
  };

  store.insertClaim(claim);
  addClaimEvent(id, providerId, 'provider', 'created', 'Prior authorization request draft created');
  return claim;
}

export function updateClaim(claimId: string, providerId: string, data: ClaimFormData): Claim | null {
  const existing = getClaimById(claimId);
  if (!existing || existing.provider_id !== providerId) return null;
  if (!['draft', 'revision_requested'].includes(existing.status)) return null;

  const merged = { ...existing, ...data };
  const validation = validateClaimFormRules(merged);

  store.updateClaim(claimId, {
    payer_id: data.payer_id ?? existing.payer_id,
    patient_name: data.patient_name ?? existing.patient_name,
    patient_id: data.patient_id ?? existing.patient_id,
    patient_dob: data.patient_dob ?? existing.patient_dob,
    patient_gender: data.patient_gender ?? existing.patient_gender,
    insurance_policy_number: data.insurance_policy_number ?? existing.insurance_policy_number,
    diagnosis_code: data.diagnosis_code ?? existing.diagnosis_code,
    diagnosis_description: data.diagnosis_description ?? existing.diagnosis_description,
    procedure_code: data.procedure_code ?? existing.procedure_code,
    procedure_description: data.procedure_description ?? existing.procedure_description,
    claim_amount: data.claim_amount ?? existing.claim_amount,
    service_date: data.service_date ?? existing.service_date,
    provider_notes: data.provider_notes ?? existing.provider_notes,
    ai_score: validation.score,
  });

  addClaimEvent(claimId, providerId, 'provider', 'updated', 'Authorization request updated');
  return getClaimById(claimId)!;
}

export function submitClaim(claimId: string, providerId: string): Claim | null {
  const claim = getClaimById(claimId);
  if (!claim || claim.provider_id !== providerId) return null;
  if (!['draft', 'revision_requested'].includes(claim.status)) return null;

  const validation = validateClaimFormRules(claim);
  if (!validation.valid) return null;
  if (!claim.payer_id) return null;

  const now = new Date().toISOString();
  store.updateClaim(claimId, { status: 'submitted', submitted_at: now });

  addClaimEvent(claimId, providerId, 'provider', 'submitted', 'Prior authorization request submitted to payer');
  createNotification(
    claim.payer_id,
    claimId,
    'New Authorization Request',
    `New prior auth request for ${claim.patient_name} — $${claim.claim_amount.toLocaleString()}`
  );

  return getClaimById(claimId)!;
}

export function getAllClaims(): Claim[] {
  return store.getAllClaims();
}

export function getClaimById(id: string): Claim | undefined {
  return store.getClaimById(id);
}

export function getClaimsForProvider(providerId: string): Claim[] {
  return store.getClaimsByProvider(providerId);
}

export function getClaimsForPayer(payerId: string): Claim[] {
  return store.getClaimsByPayer(payerId);
}

export function getClaimEvents(claimId: string): ClaimEvent[] {
  return store.getEventsByClaim(claimId);
}

export function payerReviewClaim(
  claimId: string,
  payerId: string,
  action: 'approve' | 'reject' | 'request_revision' | 'start_review',
  notes?: string,
  applyCorrections?: boolean
): Claim | null {
  const claim = getClaimById(claimId);
  if (!claim || claim.payer_id !== payerId) return null;

  const review = reviewClaimForPayerRules(claim);
  const correctedFields: Record<string, string> = {};

  if (applyCorrections && review.autoCorrections.length) {
    for (const c of review.autoCorrections) {
      correctedFields[c.field] = c.corrected;
    }
  }

  const statusMap: Record<string, ClaimStatus> = {
    approve: 'approved',
    reject: 'rejected',
    request_revision: 'revision_requested',
    start_review: 'under_review',
  };

  const newStatus = statusMap[action];
  if (!newStatus) return null;

  const allowedTransitions: Record<string, ClaimStatus[]> = {
    submitted: ['under_review', 'approved', 'rejected', 'revision_requested'],
    under_review: ['approved', 'rejected', 'revision_requested'],
    revision_requested: ['under_review'],
  };

  if (!allowedTransitions[claim.status]?.includes(newStatus)) return null;

  const updates: Partial<Claim> = {
    status: newStatus,
    payer_notes: notes || claim.payer_notes,
  };

  if (['approved', 'rejected', 'revision_requested'].includes(newStatus)) {
    updates.reviewed_at = new Date().toISOString();
  }

  if (Object.keys(correctedFields).length) {
    updates.corrected_fields = JSON.stringify(correctedFields);
    Object.assign(updates, correctedFields);
  }

  if (newStatus === 'approved') {
    updates.auth_number = generateAuthNumber();
  }

  const provider = getUserById(claim.provider_id);
  const payerUser = getUserById(payerId);
  const previewClaim = { ...claim, ...updates } as Claim;
  const fhirResponse = toFhirClaimResponse(previewClaim, provider, payerUser);
  if (fhirResponse) {
    updates.fhir_claim_response = JSON.stringify(fhirResponse);
  }

  store.updateClaim(claimId, updates);

  const actionLabels: Record<string, string> = {
    approve: 'approved prior authorization for',
    reject: 'denied prior authorization for',
    request_revision: 'requested revision for',
    start_review: 'started review of',
  };

  addClaimEvent(claimId, payerId, 'payer', action, notes || `Payer ${actionLabels[action]} authorization request`);

  const updated = getClaimById(claimId)!;

  const notificationMessages: Record<string, { title: string; message: string }> = {
    approve: {
      title: 'Authorization Approved',
      message: `Prior auth for ${claim.patient_name} approved. Auth #: ${updated.auth_number}. Amount: $${claim.claim_amount.toLocaleString()}.`,
    },
    reject: {
      title: 'Authorization Denied',
      message: `Prior auth for ${claim.patient_name} was denied.${notes ? ` Reason: ${notes}` : ''}`,
    },
    request_revision: {
      title: 'Revision Required',
      message: `Payer needs more information for ${claim.patient_name}.${notes ? ` Notes: ${notes}` : ''}`,
    },
    start_review: {
      title: 'Authorization Under Review',
      message: `Prior auth for ${claim.patient_name} is now under payer review.`,
    },
  };

  if (notificationMessages[action]) {
    const n = notificationMessages[action];
    createNotification(claim.provider_id, claimId, n.title, n.message);
  }

  return getClaimById(claimId)!;
}

export function addClaimEvent(
  claimId: string,
  actorId: string,
  actorRole: 'provider' | 'payer',
  action: string,
  details?: string
) {
  store.insertEvent({
    id: randomUUID(),
    claim_id: claimId,
    actor_id: actorId,
    actor_role: actorRole,
    action,
    details: details || null,
    created_at: new Date().toISOString(),
  });
}

export function createNotification(userId: string, claimId: string | null, title: string, message: string) {
  store.insertNotification({
    id: randomUUID(),
    user_id: userId,
    claim_id: claimId,
    title,
    message,
    read: 0,
    created_at: new Date().toISOString(),
  });
}

export function getNotifications(userId: string): Notification[] {
  return store.getNotifications(userId);
}

export function markNotificationRead(notificationId: string, userId: string) {
  store.markNotificationRead(notificationId, userId);
}

export function markAllNotificationsRead(userId: string) {
  store.markAllNotificationsRead(userId);
}

export function getUnreadCount(userId: string): number {
  return store.getUnreadCount(userId);
}

export function getDashboardStats(userId: string, role: 'provider' | 'payer'): DashboardStats {
  const claims = store.getClaimsByField(role === 'provider' ? 'provider_id' : 'payer_id', userId);
  const filtered = role === 'payer' ? claims.filter((c) => c.status !== 'draft') : claims;

  const stats: DashboardStats = {
    total: filtered.length,
    draft: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    revision_requested: 0,
    totalAmount: 0,
    approvedAmount: 0,
    pendingAmount: 0,
    recentClaims: filtered.slice(0, 5),
  };

  for (const c of filtered) {
    stats[c.status as keyof Pick<DashboardStats, 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'revision_requested'>]++;
    stats.totalAmount += c.claim_amount;
    if (c.status === 'approved') stats.approvedAmount += c.claim_amount;
    if (['submitted', 'under_review', 'revision_requested'].includes(c.status)) {
      stats.pendingAmount += c.claim_amount;
    }
  }

  return stats;
}

export function getFhirBundleForClaim(claimId: string) {
  const claim = getClaimById(claimId);
  if (!claim) return null;
  const provider = getUserById(claim.provider_id);
  const payer = claim.payer_id ? getUserById(claim.payer_id) : undefined;
  return toFhirBundle(claim, provider, payer);
}
