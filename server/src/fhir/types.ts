/** Simplified FHIR R4 resource shapes for prior authorization workflows */

export interface FhirMeta {
  versionId?: string;
  lastUpdated: string;
  profile?: string[];
}

export interface FhirIdentifier {
  system?: string;
  value: string;
}

export interface FhirReference {
  reference: string;
  display?: string;
}

export interface FhirCodeableConcept {
  coding?: { system?: string; code?: string; display?: string }[];
  text?: string;
}

export interface FhirHumanName {
  use?: string;
  family?: string;
  given?: string[];
  text?: string;
}

export interface FhirPatient {
  resourceType: 'Patient';
  id: string;
  meta: FhirMeta;
  identifier: FhirIdentifier[];
  name: FhirHumanName[];
  gender?: string;
  birthDate?: string;
}

export interface FhirCoverage {
  resourceType: 'Coverage';
  id: string;
  meta: FhirMeta;
  status: 'active' | 'cancelled' | 'draft';
  subscriberId?: string;
  beneficiary: FhirReference;
  payor: FhirReference[];
  class?: { type: FhirCodeableConcept; value: string }[];
}

export interface FhirClaimItem {
  sequence: number;
  productOrService: FhirCodeableConcept;
  servicedDate?: string;
  unitPrice?: { value: number; currency: string };
  net?: { value: number; currency: string };
}

export interface FhirClaimDiagnosis {
  sequence: number;
  diagnosisCodeableConcept: FhirCodeableConcept;
}

export interface FhirClaim {
  resourceType: 'Claim';
  id: string;
  meta: FhirMeta;
  identifier: FhirIdentifier[];
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
  type: FhirCodeableConcept;
  use: 'preauthorization';
  patient: FhirReference;
  created: string;
  insurer: FhirReference;
  provider: FhirReference;
  priority: FhirCodeableConcept;
  diagnosis?: FhirClaimDiagnosis[];
  item: FhirClaimItem[];
  supportingInfo?: { sequence: number; category: FhirCodeableConcept; valueString?: string }[];
  total?: { value: number; currency: string };
}

export interface FhirClaimResponseItem {
  itemSequence: number;
  adjudication: {
    category: FhirCodeableConcept;
    reason?: FhirCodeableConcept;
    value?: number;
  }[];
}

export interface FhirClaimResponse {
  resourceType: 'ClaimResponse';
  id: string;
  meta: FhirMeta;
  identifier?: FhirIdentifier[];
  status: 'active';
  type: FhirCodeableConcept;
  use: 'preauthorization';
  patient: FhirReference;
  created: string;
  insurer: FhirReference;
  requestor?: FhirReference;
  request: FhirReference;
  outcome: 'queued' | 'complete' | 'error' | 'partial';
  disposition?: string;
  preAuthRef?: string;
  preAuthPeriod?: { start: string; end?: string };
  item?: FhirClaimResponseItem[];
  processNote?: { type: 'display' | 'print' | 'printoper' | 'displayoper'; text: string }[];
  total?: { category: FhirCodeableConcept; amount: { value: number; currency: string } }[];
}

export interface FhirBundle {
  resourceType: 'Bundle';
  id: string;
  meta: FhirMeta;
  type: 'collection' | 'searchset';
  total?: number;
  entry: { fullUrl: string; resource: FhirPatient | FhirCoverage | FhirClaim | FhirClaimResponse }[];
}

export interface FhirCapabilityStatement {
  resourceType: 'CapabilityStatement';
  id: string;
  status: 'active';
  date: string;
  kind: 'instance';
  fhirVersion: '4.0.1';
  format: string[];
  rest: {
    mode: 'server';
    resource: {
      type: string;
      interaction: { code: string }[];
      searchParam?: { name: string; type: string; documentation: string }[];
    }[];
  }[];
}

export interface FhirOperationOutcome {
  resourceType: 'OperationOutcome';
  issue: { severity: 'error' | 'warning' | 'information'; code: string; diagnostics: string }[];
}
