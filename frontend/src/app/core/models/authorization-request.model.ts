export type RequestStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'INFO_REQUESTED';
export type Urgency = 'ROUTINE' | 'URGENT' | 'EMERGENCY';
export type PlaceOfService = 'INPATIENT' | 'OUTPATIENT' | 'EMERGENCY';
export type SubscriberRelationship = 'SELF' | 'SPOUSE' | 'CHILD' | 'OTHER';

export interface AuthorizationRequest {
  id?: number;
  status?: RequestStatus;
  providerId?: number;
  providerName?: string;
  providerOrganization?: string;
  payerId?: number;
  payerName?: string;
  payerOrganization?: string;
  documents?: DocumentFile[];
  
  // Patient Details
  patientFirstName: string;
  patientLastName: string;
  patientDob: string;
  patientGender: string;
  patientPhone: string;
  patientEmail?: string;
  patientAddress: string;

  // Insurance details
  insurancePolicyNumber: string;
  insuranceGroupNumber?: string;
  subscriberName: string;
  subscriberRelationship: SubscriberRelationship;
  coverageStartDate: string;
  coverageEndDate?: string;

  // Diagnosis details
  primaryDiagnosisCode: string;
  primaryDiagnosisDesc: string;
  secondaryDiagnosisCode?: string;
  secondaryDiagnosisDesc?: string;

  // Procedure details
  procedureCode: string;
  procedureDescription: string;
  estimatedCost: number;
  serviceDate: string;
  urgency: Urgency;
  placeOfService: PlaceOfService;

  // Clinical Justification
  clinicalNotes: string;

  // Decision & Audit details
  payerRemarks?: string;
  aiValidationNotes?: string;
  aiQualityScore?: number;
  fhirBundleJson?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StatusHistory {
  id: number;
  requestId: number;
  fromStatus?: RequestStatus;
  toStatus: RequestStatus;
  changedByName: string;
  remarks?: string;
  changedAt: string;
}

export interface DocumentFile {
  id: number;
  requestId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}
