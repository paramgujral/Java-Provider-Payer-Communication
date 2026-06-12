// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  role: 'PROVIDER' | 'PAYER' | 'ADMIN';
  fullName: string;
  organization: string;
}

// ─── Authorization Case ───────────────────────────────────────────────────────
export type CaseStatus = 'DRAFT' | 'TRANSMITTED' | 'PAYER_REVIEW' | 'INFO_REQUESTED' | 'FINALIZED';
export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED';

export interface AuthorizationCase {
  caseId: string;
  patientName: string;
  patientDob: string;
  patientGender: string;
  patientMemberId: string;
  npiNumber: string;
  providerName: string;
  icd10Code: string;
  diagnosisDescription: string;
  cptCode: string;
  procedureDescription: string;
  clinicalNotes: string;
  insuranceId: string;
  insurancePlan: string;
  urgencyLevel: string;
  aiRiskScore: number;
  aiRiskLevel: RiskLevel;
  aiAnalysis: string;
  status: CaseStatus;
  providerUsername: string;
  providerFullName: string;
  payerDecision?: string;
  payerNotes?: string;
  clarificationRequested?: string;
  createdAt: string;
  submittedAt?: string;
  updatedAt: string;
}

export interface AuthorizationRequest {
  patientName: string;
  patientDob: string;
  patientGender: string;
  patientMemberId: string;
  npiNumber: string;
  providerName: string;
  icd10Code: string;
  diagnosisDescription: string;
  cptCode: string;
  procedureDescription: string;
  clinicalNotes: string;
  insuranceId: string;
  insurancePlan: string;
  urgencyLevel: string;
}

export interface AiAnalysisResult {
  riskScore: number;
  riskLevel: RiskLevel;
  issues: string[];
  suggestions: string[];
  analysisSummary: string;
  autoFixSuggestions: Record<string, string>;
}

// ─── Communication ────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: number;
  fhirResourceId: string;
  caseId: string;
  senderUsername: string;
  senderFullName: string;
  senderRole: string;
  messageContent: string;
  messageType: 'CHAT' | 'SYSTEM' | 'AI_INSIGHT' | 'CLARIFICATION_REQUEST';
  sentAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export type NotificationType = 'CRITICAL' | 'WARNING' | 'SUCCESS' | 'AI_INSIGHT';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  relatedCaseId?: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface ProviderDashboard {
  totalCases: number;
  draftCases: number;
  transmittedCases: number;
  pendingReview: number;
  infoRequested: number;
  finalized: number;
  avgRiskScore: number;
  recentCases: Partial<AuthorizationCase>[];
}

export interface PayerDashboard {
  totalSubmitted: number;
  pendingReview: number;
  infoRequested: number;
  finalized: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  recentCases: Partial<AuthorizationCase>[];
}

export interface KanbanBoard {
  DRAFT: Partial<AuthorizationCase>[];
  TRANSMITTED: Partial<AuthorizationCase>[];
  PAYER_REVIEW: Partial<AuthorizationCase>[];
  INFO_REQUESTED: Partial<AuthorizationCase>[];
  FINALIZED: Partial<AuthorizationCase>[];
}
