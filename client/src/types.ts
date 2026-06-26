export type UserRole = 'provider' | 'payer';

export type ClaimStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'revision_requested';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization: string;
  created_at: string;
}

export interface Claim {
  id: string;
  provider_id: string;
  payer_id: string | null;
  status: ClaimStatus;
  patient_name: string;
  patient_id: string;
  patient_dob: string;
  patient_gender: string;
  insurance_policy_number: string;
  diagnosis_code: string;
  diagnosis_description: string;
  procedure_code: string;
  procedure_description: string;
  claim_amount: number;
  service_date: string;
  provider_notes: string;
  payer_notes: string | null;
  corrected_fields: string | null;
  auth_number: string | null;
  fhir_claim_response: string | null;
  ai_score: number | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
}

export interface ClaimEvent {
  id: string;
  claim_id: string;
  actor_id: string;
  actor_role: UserRole;
  action: string;
  details: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  claim_id: string | null;
  title: string;
  message: string;
  read: number;
  created_at: string;
}

export interface AIValidationResult {
  valid: boolean;
  score: number;
  issues: { field: string; severity: 'error' | 'warning' | 'info'; message: string }[];
  recommendations: { field: string; suggestion: string; reason: string }[];
  engine?: 'rules' | 'hybrid';
  llmInsight?: string | null;
}

export interface AiEngineStatus {
  llmConfigured: boolean;
  llmEnabled: boolean;
  model: string;
  mode: 'hybrid' | 'rules_only';
}

export interface PayerReviewResult {
  autoCorrections: { field: string; original: string; corrected: string; reason: string }[];
  riskFlags: { field: string; message: string; severity: 'low' | 'medium' | 'high' }[];
  suggestedAction: 'approve' | 'reject' | 'request_revision' | 'review_manually';
  confidence: number;
  summary: string;
  engine?: 'rules' | 'hybrid';
  llmInsight?: string | null;
}

export interface DashboardStats {
  total: number;
  draft: number;
  submitted: number;
  under_review: number;
  approved: number;
  rejected: number;
  revision_requested: number;
  totalAmount: number;
  approvedAmount: number;
  pendingAmount: number;
  recentClaims: Claim[];
}

export interface ClaimFormData {
  patient_name?: string;
  patient_id?: string;
  patient_dob?: string;
  patient_gender?: string;
  insurance_policy_number?: string;
  diagnosis_code?: string;
  diagnosis_description?: string;
  procedure_code?: string;
  procedure_description?: string;
  claim_amount?: number;
  service_date?: string;
  provider_notes?: string;
  payer_id?: string | null;
}
