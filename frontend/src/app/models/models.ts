export type RequestStatus =
  | 'DRAFT' | 'SUBMITTED' | 'PENDING_REVIEW' | 'INFO_REQUESTED'
  | 'APPROVED' | 'DENIED' | 'CANCELLED';

export type Severity = 'ERROR' | 'WARNING' | 'INFO';

export interface Diagnosis {
  icd10Code: string;
  description?: string;
  isPrincipal?: boolean;
}

export interface ServiceLine {
  cptCode: string;
  description?: string;
  units?: number;
  unitType?: string;
}

export interface CopilotIssue {
  id?: number;
  severity: Severity;
  field: string;
  problem: string;
  recommendation: string;
  autoFixable?: boolean;
}

export interface CopilotReview {
  id?: number;
  source: 'LLM' | 'RULES';
  readinessScore: number;
  decision: 'READY' | 'NEEDS_FIXES';
  predictedOutcome: 'LIKELY_APPROVE' | 'UNCERTAIN' | 'LIKELY_DENY';
  medicalNecessity: string;
  summary: string;
  issues: CopilotIssue[];
}

export interface StatusEvent {
  status: string;
  actor: string;
  note: string;
  createdAt: string;
}

export interface AuthorizationRequest {
  id?: number;
  reference?: string;
  status: RequestStatus;
  priority?: string;
  patientMrn?: string;
  patientName: string;
  patientBirthDate?: string;
  patientGender?: string;
  memberId?: string;
  payerName: string;
  planName?: string;
  providerNpi?: string;
  providerName: string;
  providerOrg?: string;
  providerSpecialty?: string;
  placeOfService?: string;
  serviceStart?: string;
  serviceEnd?: string;
  clinicalNotes?: string;
  readinessScore?: number;
  predictedOutcome?: string;
  decision?: string;
  decisionRationale?: string;
  authorizationNumber?: string;
  authValidFrom?: string;
  authValidTo?: string;
  createdAt?: string;
  updatedAt?: string;
  diagnoses: Diagnosis[];
  serviceLines: ServiceLine[];
  copilotReview?: CopilotReview;
  history?: StatusEvent[];
}

export interface DecisionDto {
  decision: 'APPROVED' | 'DENIED' | 'INFO_REQUESTED' | 'PARTIAL';
  rationale?: string;
  authorizationNumber?: string;
  authValidFrom?: string;
  authValidTo?: string;
}

export interface AppNotification {
  id: number;
  requestId?: number;
  recipient: string;
  title: string;
  message: string;
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';
  readFlag: boolean;
  createdAt: string;
}
