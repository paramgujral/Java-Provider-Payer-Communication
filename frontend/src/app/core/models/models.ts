// ─── Enums ────────────────────────────────────────────────────────────────────

export type Role = 'PROVIDER' | 'PAYER';

export type RequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'INFO_REQUESTED'
  | 'RESUBMITTED'
  | 'APPROVED'
  | 'DENIED';

export type NotificationType =
  | 'REQUEST_APPROVED'
  | 'REQUEST_DENIED'
  | 'INFO_REQUESTED'
  | 'AI_WARNING';

export type AuditAction =
  | 'CREATED'
  | 'SUBMITTED'
  | 'REVIEWED'
  | 'APPROVED'
  | 'DENIED'
  | 'RESUBMITTED'
  | 'INFO_REQUESTED';

export type Priority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

export type ReviewDecision = 'APPROVE' | 'DENY' | 'REQUEST_INFO';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  email: string;
  fullName: string;
  organization: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ─── Authorization Request ────────────────────────────────────────────────────

export interface AuthorizationRequest {
  id: number;
  referenceNumber: string;

  patientName: string;
  patientDob: string;
  patientMemberId: string;
  patientInsurancePlan: string;

  diagnosisCode: string;
  diagnosisDescription: string;
  procedureCode: string;
  procedureDescription: string;
  serviceType: string;
  requestedServiceDate: string;
  requestedServiceEndDate: string;
  facilityName: string;
  treatingPhysician: string;
  clinicalNotes: string;
  supportingDocuments: string;

  aiCompletenessScore: number;
  aiApprovalProbability: number;
  aiRecommendations: string[];

  reviewerNotes: string;
  denialReason: string;
  additionalInfoRequested: string;

  status: RequestStatus;
  statusDisplayName: string;
  priority: Priority;

  providerId: number;
  providerName: string;
  providerOrganization: string;
  reviewerId: number | null;
  reviewerName: string | null;

  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  resolvedAt: string | null;
}

export interface CreateAuthorizationRequest {
  patientName: string;
  patientDob: string;
  patientMemberId: string;
  patientInsurancePlan: string;
  diagnosisCode: string;
  diagnosisDescription: string;
  procedureCode: string;
  procedureDescription: string;
  serviceType: string;
  requestedServiceDate: string;
  requestedServiceEndDate: string;
  facilityName: string;
  treatingPhysician: string;
  clinicalNotes: string;
  supportingDocuments: string;
  priority: Priority;
}

export interface ResubmitRequest {
  clinicalNotes?: string;
  supportingDocuments?: string;
  additionalInfo?: string;
  diagnosisCode?: string;
  diagnosisDescription?: string;
  procedureCode?: string;
  procedureDescription?: string;
  facilityName?: string;
  treatingPhysician?: string;
}

export interface ReviewDecisionRequest {
  decision: ReviewDecision;
  reviewerNotes?: string;
  denialReason?: string;
  additionalInfoRequested?: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface ProviderDashboard {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  deniedRequests: number;
  inReviewRequests: number;
  infoRequestedRequests: number;
  draftRequests: number;
}

export interface PayerDashboard {
  pendingReviews: number;
  processedToday: number;
  approvedToday: number;
  deniedToday: number;
  infoRequestedCount: number;
  approvalRate: number;
  totalInQueue: number;
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export interface AiIssue {
  severity: 'ERROR' | 'WARNING' | 'INFO';
  field?: string;
  title: string;
  detail: string;
  suggestion?: string;
}

export interface AiAnalysis {
  completenessScore: number;
  approvalProbability: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  issues: AiIssue[];
  recommendations: string[];
  missingFields: string[];
  warnings: string[];
  summary: string;
  suggestedNarrative?: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: number;
  type: NotificationType;
  typeDisplayName: string;
  title: string;
  message: string;
  read: boolean;
  requestId: number | null;
  referenceNumber: string | null;
  createdAt: string;
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: number;
  action: AuditAction;
  actionDisplayName: string;
  description: string;
  details: string | null;
  performedByName: string;
  performedByRole: string;
  createdAt: string;
}

// ─── API Wrapper ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
  timestamp: string;
}
