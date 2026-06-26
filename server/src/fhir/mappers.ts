import type { Claim, ClaimStatus, User } from '../types.js';
import type {
  FhirBundle,
  FhirCapabilityStatement,
  FhirClaim,
  FhirClaimResponse,
  FhirCoverage,
  FhirPatient,
} from './types.js';

const FHIR_BASE = process.env.FHIR_BASE_URL || 'http://localhost:3001/fhir';
const PA_PROFILE = 'http://hl7.org/fhir/us/davinci-pas/StructureDefinition/profile-claim';

function meta(updated = new Date().toISOString()) {
  return {
    lastUpdated: updated,
    profile: [PA_PROFILE],
  };
}

function patientId(claim: Claim): string {
  return claim.patient_id.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase() || claim.id.slice(0, 8);
}

function coverageId(claim: Claim): string {
  return claim.insurance_policy_number.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || `cov-${claim.id.slice(0, 8)}`;
}

function splitName(full: string): { given: string[]; family: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length <= 1) return { given: [full], family: '' };
  return { given: parts.slice(0, -1), family: parts[parts.length - 1] };
}

function genderCode(g: string): string {
  const m: Record<string, string> = { male: 'male', female: 'female', other: 'other' };
  return m[g.toLowerCase()] || 'unknown';
}

function claimStatusToFhir(status: ClaimStatus): FhirClaim['status'] {
  if (status === 'draft') return 'draft';
  if (status === 'rejected') return 'cancelled';
  return 'active';
}

function outcomeFromStatus(status: ClaimStatus): FhirClaimResponse['outcome'] {
  if (['submitted', 'under_review'].includes(status)) return 'queued';
  if (status === 'revision_requested') return 'partial';
  if (status === 'rejected') return 'error';
  return 'complete';
}

export function toFhirPatient(claim: Claim): FhirPatient {
  const id = patientId(claim);
  const { given, family } = splitName(claim.patient_name);
  return {
    resourceType: 'Patient',
    id,
    meta: meta(claim.updated_at),
    identifier: [
      { system: 'http://hospital.example.org/patient-id', value: claim.patient_id },
    ],
    name: [{ use: 'official', given, family, text: claim.patient_name }],
    gender: genderCode(claim.patient_gender),
    birthDate: claim.patient_dob,
  };
}

export function toFhirCoverage(claim: Claim, payer?: User): FhirCoverage {
  const id = coverageId(claim);
  const pid = patientId(claim);
  return {
    resourceType: 'Coverage',
    id,
    meta: meta(claim.updated_at),
    status: 'active',
    subscriberId: claim.insurance_policy_number,
    beneficiary: { reference: `Patient/${pid}`, display: claim.patient_name },
    payor: [
      {
        reference: payer ? `Organization/${payer.id}` : `Organization/payer`,
        display: payer?.organization || 'Insurance Payer',
      },
    ],
    class: [
      {
        type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/coverage-class', code: 'plan' }] },
        value: claim.insurance_policy_number,
      },
    ],
  };
}

export function toFhirClaim(claim: Claim, provider?: User, payer?: User): FhirClaim {
  const pid = patientId(claim);
  return {
    resourceType: 'Claim',
    id: claim.id,
    meta: meta(claim.updated_at),
    identifier: [
      {
        system: 'http://hospital.example.org/authorization-request',
        value: claim.id,
      },
    ],
    status: claimStatusToFhir(claim.status),
    type: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/claim-type', code: 'professional', display: 'Professional' }],
    },
    use: 'preauthorization',
    patient: { reference: `Patient/${pid}`, display: claim.patient_name },
    created: claim.created_at,
    insurer: {
      reference: payer ? `Organization/${payer.id}` : `Organization/${claim.payer_id}`,
      display: payer?.organization,
    },
    provider: {
      reference: provider ? `Organization/${provider.id}` : `Organization/${claim.provider_id}`,
      display: provider?.organization,
    },
    priority: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/processpriority', code: 'normal' }],
    },
    diagnosis: [
      {
        sequence: 1,
        diagnosisCodeableConcept: {
          coding: [{ system: 'http://hl7.org/fhir/sid/icd-10', code: claim.diagnosis_code, display: claim.diagnosis_description }],
          text: claim.diagnosis_description,
        },
      },
    ],
    item: [
      {
        sequence: 1,
        productOrService: {
          coding: [{ system: 'http://www.ama-assn.org/go/cpt', code: claim.procedure_code, display: claim.procedure_description }],
          text: claim.procedure_description,
        },
        servicedDate: claim.service_date,
        unitPrice: { value: claim.claim_amount, currency: 'USD' },
        net: { value: claim.claim_amount, currency: 'USD' },
      },
    ],
    supportingInfo: claim.provider_notes
      ? [
          {
            sequence: 1,
            category: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/claiminformationcategory', code: 'info' }] },
            valueString: claim.provider_notes,
          },
        ]
      : undefined,
    total: { value: claim.claim_amount, currency: 'USD' },
  };
}

export function toFhirClaimResponse(
  claim: Claim,
  provider?: User,
  payer?: User
): FhirClaimResponse | null {
  if (claim.status === 'draft') return null;

  const pid = patientId(claim);
  const outcome = outcomeFromStatus(claim.status);

  const response: FhirClaimResponse = {
    resourceType: 'ClaimResponse',
    id: `${claim.id}-response`,
    meta: meta(claim.reviewed_at || claim.updated_at),
    identifier: claim.auth_number
      ? [{ system: 'http://payer.example.org/authorization-number', value: claim.auth_number }]
      : undefined,
    status: 'active',
    type: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/claim-type', code: 'professional' }],
    },
    use: 'preauthorization',
    patient: { reference: `Patient/${pid}`, display: claim.patient_name },
    created: claim.reviewed_at || claim.submitted_at || claim.updated_at,
    insurer: {
      reference: payer ? `Organization/${payer.id}` : `Organization/${claim.payer_id}`,
      display: payer?.organization,
    },
    requestor: {
      reference: provider ? `Organization/${provider.id}` : `Organization/${claim.provider_id}`,
      display: provider?.organization,
    },
    request: { reference: `Claim/${claim.id}` },
    outcome,
    disposition: dispositionText(claim.status, claim.payer_notes),
    item: [
      {
        itemSequence: 1,
        adjudication: adjudicationForStatus(claim.status, claim.claim_amount),
      },
    ],
  };

  if (claim.status === 'approved' && claim.auth_number) {
    response.preAuthRef = claim.auth_number;
    response.preAuthPeriod = {
      start: claim.service_date,
      end: addDays(claim.service_date, 90),
    };
  }

  if (claim.payer_notes) {
    response.processNote = [{ type: 'display', text: claim.payer_notes }];
  }

  if (claim.status === 'approved') {
    response.total = [
      {
        category: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/adjudication', code: 'benefit' }] },
        amount: { value: claim.claim_amount, currency: 'USD' },
      },
    ];
  }

  return response;
}

function dispositionText(status: ClaimStatus, notes: string | null): string {
  const map: Record<ClaimStatus, string> = {
    draft: 'Authorization request not yet submitted',
    submitted: 'Authorization request received and pending review',
    under_review: 'Authorization request is under active review',
    approved: 'Prior authorization approved',
    rejected: 'Prior authorization denied',
    revision_requested: 'Additional information required from provider',
  };
  return notes ? `${map[status]}: ${notes}` : map[status];
}

function adjudicationForStatus(status: ClaimStatus, amount: number) {
  const base = { category: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/adjudication', code: 'submitted' }] }, value: amount };
  if (status === 'approved') {
    return [
      base,
      { category: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/adjudication', code: 'benefit' }] }, value: amount },
    ];
  }
  if (status === 'rejected') {
    return [
      base,
      {
        category: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/adjudication', code: 'denial' }] },
        reason: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/adjudication-reason', code: 'pa' }], text: 'Prior authorization denied' },
      },
    ];
  }
  return [base];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function toFhirBundle(claim: Claim, provider?: User, payer?: User): FhirBundle {
  const patient = toFhirPatient(claim);
  const coverage = toFhirCoverage(claim, payer);
  const fhirClaim = toFhirClaim(claim, provider, payer);
  const response = toFhirClaimResponse(claim, provider, payer);

  const entry: FhirBundle['entry'] = [
    { fullUrl: `${FHIR_BASE}/Patient/${patient.id}`, resource: patient },
    { fullUrl: `${FHIR_BASE}/Coverage/${coverage.id}`, resource: coverage },
    { fullUrl: `${FHIR_BASE}/Claim/${fhirClaim.id}`, resource: fhirClaim },
  ];

  if (response) {
    entry.push({ fullUrl: `${FHIR_BASE}/ClaimResponse/${response.id}`, resource: response });
  }

  return {
    resourceType: 'Bundle',
    id: `auth-${claim.id}`,
    meta: meta(),
    type: 'collection',
    total: entry.length,
    entry,
  };
}

export function getCapabilityStatement(): FhirCapabilityStatement {
  return {
    resourceType: 'CapabilityStatement',
    id: 'healthcare-connector',
    status: 'active',
    date: new Date().toISOString(),
    kind: 'instance',
    fhirVersion: '4.0.1',
    format: ['json'],
    rest: [
      {
        mode: 'server',
        resource: [
          {
            type: 'Patient',
            interaction: [{ code: 'read' }, { code: 'search-type' }],
            searchParam: [{ name: 'identifier', type: 'token', documentation: 'Patient identifier' }],
          },
          {
            type: 'Coverage',
            interaction: [{ code: 'read' }, { code: 'search-type' }],
          },
          {
            type: 'Claim',
            interaction: [{ code: 'read' }, { code: 'create' }, { code: 'search-type' }],
            searchParam: [
              { name: 'patient', type: 'reference', documentation: 'Patient reference' },
              { name: 'use', type: 'token', documentation: 'Claim use (preauthorization)' },
            ],
          },
          {
            type: 'ClaimResponse',
            interaction: [{ code: 'read' }, { code: 'search-type' }],
            searchParam: [{ name: 'request', type: 'reference', documentation: 'Claim reference' }],
          },
        ],
      },
    ],
  };
}

export function generateAuthNumber(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 900000 + 100000);
  return `PA-${year}-${seq}`;
}

export function parseStoredClaimResponse(json: string | null): FhirClaimResponse | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as FhirClaimResponse;
  } catch {
    return null;
  }
}
