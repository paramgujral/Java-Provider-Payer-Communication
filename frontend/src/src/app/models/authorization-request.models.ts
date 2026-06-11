export interface AuthorizationRequest {
  id: string;
  patientName: string;
  patientId: string;
  insuranceId: string;
  insuranceProvider: string;
  diagnosis: string;
  procedure: string;
  clinicalNotes: string;
  estimatedCost: number;
  supportingDocuments: DocumentFile[];
  status: AuthorizationStatus;
  requestDate: Date;
  lastUpdated: Date;
  requestedBy?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export enum AuthorizationStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  PENDING_REVIEW = 'Pending Review',
  ADDITIONAL_INFO_REQUIRED = 'Additional Information Required',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface CreateAuthorizationRequest {
  patientName: string;
  patientId: string;
  insuranceId: string;
  insuranceProvider: string;
  diagnosis: string;
  procedure: string;
  clinicalNotes: string;
  estimatedCost: number;
}

export interface UpdateAuthorizationRequest extends Partial<CreateAuthorizationRequest> {
  status?: AuthorizationStatus;
  rejectionReason?: string;
  lastUpdated?: Date;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  url: string;
}

export interface CopilotRecommendation {
  completenessScore: number;
  missingDocuments: string[];
  recommendations: string[];
  suggestedNextSteps: string[];
}
