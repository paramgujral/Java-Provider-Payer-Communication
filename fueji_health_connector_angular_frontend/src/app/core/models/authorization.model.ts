export type AuthorizationStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'UNDER_REVIEW';

export interface AuthorizationRequest {
  id: string;
  providerId: string;
  payerId: string;
  patientName: string;
  procedureCode: string;
  procedureName: string;
  status: AuthorizationStatus;
  aiReviewNotes?: string;
  approvalNotes?: string;
  denialReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAuthorizationRequest {
  patientName: string;
  procedureCode: string;
  procedureName: string;
}
