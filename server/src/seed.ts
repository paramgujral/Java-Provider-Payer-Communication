import { randomUUID } from 'crypto';
import type { Claim, ClaimEvent, Notification, User } from './types.js';
import { DEMO_USERS } from './demoUsers.js';
import { toFhirClaimResponse } from './fhir/mappers.js';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function dateOnly(daysAgoNum: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgoNum);
  return d.toISOString().slice(0, 10);
}

export function buildDemoData(_users: User[]): {
  claims: Claim[];
  events: ClaimEvent[];
  notifications: Notification[];
} {
  const provider = DEMO_USERS.find((u) => u.email === 'provider@cityhospital.com')!;
  const clinic = DEMO_USERS.find((u) => u.email === 'clinic@sunrise.com')!;
  const healthguard = DEMO_USERS.find((u) => u.email === 'payer@healthguard.com')!;
  const careplus = DEMO_USERS.find((u) => u.email === 'payer@careplus.com')!;

  const claim1Id = randomUUID();
  const claim2Id = randomUUID();
  const claim3Id = randomUUID();
  const claim4Id = randomUUID();

  const claims: Claim[] = [
    {
      id: claim1Id,
      provider_id: provider.id,
      payer_id: healthguard.id,
      status: 'submitted',
      patient_name: 'John Smith',
      patient_id: 'PAT-10001',
      patient_dob: '1975-03-15',
      patient_gender: 'Male',
      insurance_policy_number: 'HG12345678',
      diagnosis_code: 'E11.9',
      diagnosis_description: 'Type 2 diabetes mellitus without complications',
      procedure_code: '99213',
      procedure_description: 'Office visit, established patient, low complexity',
      claim_amount: 225,
      service_date: dateOnly(5),
      provider_notes: 'Patient presented for routine diabetes follow-up. A1C reviewed, medication adjusted.',
      payer_notes: null,
      corrected_fields: null,
      auth_number: null,
      fhir_claim_response: null,
      ai_score: 92,
      created_at: daysAgo(6),
      updated_at: daysAgo(4),
      submitted_at: daysAgo(4),
      reviewed_at: null,
    },
    {
      id: claim2Id,
      provider_id: provider.id,
      payer_id: healthguard.id,
      status: 'under_review',
      patient_name: 'Maria Garcia',
      patient_id: 'PAT-10002',
      patient_dob: '1988-07-22',
      patient_gender: 'Female',
      insurance_policy_number: 'HG87654321',
      diagnosis_code: 'J18.9',
      diagnosis_description: 'Pneumonia, unspecified organism',
      procedure_code: '71046',
      procedure_description: 'Chest X-ray, two views',
      claim_amount: 450,
      service_date: dateOnly(10),
      provider_notes: 'Patient with persistent cough and fever. Chest X-ray ordered to rule out pneumonia.',
      payer_notes: null,
      corrected_fields: null,
      auth_number: null,
      fhir_claim_response: null,
      ai_score: 88,
      created_at: daysAgo(11),
      updated_at: daysAgo(2),
      submitted_at: daysAgo(8),
      reviewed_at: null,
    },
    {
      id: claim3Id,
      provider_id: clinic.id,
      payer_id: careplus.id,
      status: 'approved',
      patient_name: 'Robert Johnson',
      patient_id: 'PAT-20001',
      patient_dob: '1962-11-08',
      patient_gender: 'Male',
      insurance_policy_number: 'CP99887766',
      diagnosis_code: 'I10',
      diagnosis_description: 'Essential hypertension',
      procedure_code: '99213',
      procedure_description: 'Office visit, established patient',
      claim_amount: 180,
      service_date: dateOnly(20),
      provider_notes: 'Blood pressure monitoring visit. Lisinopril dosage maintained.',
      payer_notes: 'Approved per standard fee schedule.',
      corrected_fields: null,
      auth_number: 'PA-2026-100001',
      fhir_claim_response: null,
      ai_score: 95,
      created_at: daysAgo(22),
      updated_at: daysAgo(15),
      submitted_at: daysAgo(21),
      reviewed_at: daysAgo(15),
    },
    {
      id: claim4Id,
      provider_id: clinic.id,
      payer_id: healthguard.id,
      status: 'revision_requested',
      patient_name: 'Emily Davis',
      patient_id: 'PAT-20002',
      patient_dob: '1995-01-30',
      patient_gender: 'Female',
      insurance_policy_number: 'HG11223344',
      diagnosis_code: 'G43.909',
      diagnosis_description: 'Migraine, unspecified, not intractable',
      procedure_code: '99214',
      procedure_description: 'Office visit, moderate complexity',
      claim_amount: 320,
      service_date: dateOnly(7),
      provider_notes: 'Migraine evaluation.',
      payer_notes: 'Please provide detailed clinical notes and confirm CPT code matches visit complexity.',
      corrected_fields: null,
      auth_number: null,
      fhir_claim_response: null,
      ai_score: 72,
      created_at: daysAgo(9),
      updated_at: daysAgo(1),
      submitted_at: daysAgo(7),
      reviewed_at: daysAgo(1),
    },
  ];

  const approved = claims.find((c) => c.status === 'approved')!;
  const revision = claims.find((c) => c.status === 'revision_requested')!;
  approved.fhir_claim_response = JSON.stringify(toFhirClaimResponse(approved, clinic, careplus));
  revision.fhir_claim_response = JSON.stringify(toFhirClaimResponse(revision, clinic, healthguard));

  const events: ClaimEvent[] = [
    { id: randomUUID(), claim_id: claim1Id, actor_id: provider.id, actor_role: 'provider', action: 'created', details: 'Authorization request draft created', created_at: daysAgo(6) },
    { id: randomUUID(), claim_id: claim1Id, actor_id: provider.id, actor_role: 'provider', action: 'submitted', details: 'Prior authorization submitted', created_at: daysAgo(4) },
    { id: randomUUID(), claim_id: claim2Id, actor_id: provider.id, actor_role: 'provider', action: 'created', details: 'Claim draft created', created_at: daysAgo(11) },
    { id: randomUUID(), claim_id: claim2Id, actor_id: provider.id, actor_role: 'provider', action: 'submitted', details: 'Claim submitted to payer', created_at: daysAgo(8) },
    { id: randomUUID(), claim_id: claim2Id, actor_id: healthguard.id, actor_role: 'payer', action: 'start_review', details: 'Payer started review of claim', created_at: daysAgo(2) },
    { id: randomUUID(), claim_id: claim3Id, actor_id: clinic.id, actor_role: 'provider', action: 'submitted', details: 'Claim submitted to payer', created_at: daysAgo(21) },
    { id: randomUUID(), claim_id: claim3Id, actor_id: careplus.id, actor_role: 'payer', action: 'approve', details: 'Approved per standard fee schedule.', created_at: daysAgo(15) },
    { id: randomUUID(), claim_id: claim4Id, actor_id: clinic.id, actor_role: 'provider', action: 'submitted', details: 'Claim submitted to payer', created_at: daysAgo(7) },
    { id: randomUUID(), claim_id: claim4Id, actor_id: healthguard.id, actor_role: 'payer', action: 'request_revision', details: 'Please provide detailed clinical notes and confirm CPT code matches visit complexity.', created_at: daysAgo(1) },
  ];

  const notifications: Notification[] = [
    {
      id: randomUUID(),
      user_id: healthguard.id,
      claim_id: claim1Id,
      title: 'New Authorization Request',
      message: 'New prior auth request for patient John Smith — $225',
      read: 0,
      created_at: daysAgo(4),
    },
    {
      id: randomUUID(),
      user_id: clinic.id,
      claim_id: claim4Id,
      title: 'Revision Requested',
      message: 'Payer requested changes to claim for Emily Davis. Notes: Please provide detailed clinical notes and confirm CPT code matches visit complexity.',
      read: 0,
      created_at: daysAgo(1),
    },
    {
      id: randomUUID(),
      user_id: provider.id,
      claim_id: claim2Id,
      title: 'Claim Under Review',
      message: 'Your claim for Maria Garcia is now under review by the payer.',
      read: 1,
      created_at: daysAgo(2),
    },
  ];

  return { claims, events, notifications };
}
