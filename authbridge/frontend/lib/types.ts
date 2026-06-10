// Domain types shared across the AuthBridge frontend and its API routes.
// These mirror the Java backend DTOs (see backend/.../dto) so the contract
// is identical whether the UI talks to the in-memory routes or Spring Boot.

export type Role = "PROVIDER" | "PAYER";

export type RequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "INFO_REQUESTED"
  | "APPROVED"
  | "DENIED"
  | "RESUBMITTED";

export type Priority = "ROUTINE" | "URGENT" | "STAT";

export interface ClinicalDocument {
  id: string;
  name: string;
  type: string; // e.g. "Clinical Notes", "Lab Result", "Imaging"
  sizeKb: number;
  uploadedAt: string;
}

export interface TimelineEvent {
  id: string;
  at: string;
  actor: string; // display name + org
  role: Role | "SYSTEM" | "COPILOT";
  action: string;
  note?: string;
  fromStatus?: RequestStatus;
  toStatus?: RequestStatus;
}

export interface CopilotIssue {
  severity: "ERROR" | "WARNING" | "INFO";
  field?: string;
  title: string;
  detail: string;
  suggestion?: string;
}

export interface CopilotReview {
  completenessScore: number; // 0-100
  approvalLikelihood: number; // 0-100
  issues: CopilotIssue[];
  summary: string;
  suggestedNarrative?: string;
  generatedBy: "rules" | "llm";
  generatedAt: string;
}

export interface AuthRequest {
  id: string;
  referenceNo: string;
  status: RequestStatus;
  priority: Priority;

  // Provider / payer org context
  providerOrg: string;
  payerOrg: string;
  submittedBy?: string;
  assignedReviewer?: string;

  // Patient (de-identified in this demo)
  patientName: string;
  patientDob: string;
  memberId: string;

  // Clinical
  serviceRequested: string;
  cptCodes: string[];
  icd10Codes: string[];
  placeOfService: string;
  requestedUnits: number;
  clinicalJustification: string;

  documents: ClinicalDocument[];
  copilot?: CopilotReview;
  timeline: TimelineEvent[];

  decisionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  role: Role;
  requestId?: string;
  referenceNo?: string;
  title: string;
  body: string;
  channel: "IN_APP" | "EMAIL" | "SMS";
  read: boolean;
  createdAt: string;
}

export interface Session {
  role: Role;
  name: string;
  org: string;
}
