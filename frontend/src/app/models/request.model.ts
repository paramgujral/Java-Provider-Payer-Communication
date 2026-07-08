export enum RequestStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum ResponseStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING'
}

export interface AuthorizationRequest {
  id: number;
  requestId: string;
  patientId: string;
  serviceType: string;
  requestDate: string;
  status: RequestStatus;
  provider: { id: number; name: string; npi: string };
  payer: { id: number; name: string; payerId: string };
  fhirClaimJson: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiReview {
  id: number;
  score: number;
  issues: string;
  suggestions: string;
  reviewDate: string;
}

export interface CreateRequestDto {
  patientId: string;
  serviceType: string;
  payerId: number;
}

export interface ResponseDto {
  status: ResponseStatus;
  notes: string;
}

export interface Notification {
  id: number;
  message: string;
  sentDate: string;
  isRead: boolean;
}