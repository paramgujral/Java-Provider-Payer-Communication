export type UserRole = 'PROVIDER' | 'PAYER';

export type AuthorizationStatus = 'DRAFT' | 'PENDING_REVIEW' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export interface AuthorizationRequest {
  id?: number;
  patientName: string;
  patientDob: string;
  patientGender: string;
  diagnosisCode: string;
  diagnosisDescription: string;
  requestedProcedure: string;
  insuranceProvider: string;
  policyNumber: string;
  groupNumber: string;
  memberId: string;
  status?: AuthorizationStatus;
  createdAt?: string;
  updatedAt?: string;
  payerNotes?: string;
}

export interface AppNotification {
  id: number;
  message: string;
  recipientRole: UserRole;
  requestId: number;
  createdAt: string;
  read: boolean;
}

export interface AuthUser {
  username: string;
  role: UserRole;
  token: string;
}
