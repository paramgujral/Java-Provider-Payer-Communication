import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api-config';

export interface ClaimDTO {
  id: string;
  patientId: string;
  policyId: string;
  diseaseId: string;
  amount: number;
  remarks?: string;
  status: string;
  claimNumber?: string;
  requestedAmount?: number;
  approvedAmount?: number;
  healthcareRemarks?: string;
  insuranceRemarks?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimDocumentDTO {
  id: string;
  fileName: string;
  filePath: string;
  documentType: string;
  claimId: string;
}

export interface CreateClaimPayload {
  patientId: string;
  policyId: string;
  diseaseId: string;
  amount: number;
  remarks?: string;
}

export interface UpdateClaimPayload {
  patientId?: string;
  policyId?: string;
  diseaseId?: string;
  amount?: number;
  remarks?: string;
}

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/claims`;

  listAll(): Observable<ClaimDTO[]> {
    return this.http.get<ClaimDTO[]>(this.baseUrl);
  }

  getById(id: string): Observable<ClaimDTO> {
    return this.http.get<ClaimDTO>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateClaimPayload): Observable<ClaimDTO> {
    return this.http.post<ClaimDTO>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateClaimPayload): Observable<ClaimDTO> {
    return this.http.put<ClaimDTO>(`${this.baseUrl}/${id}`, payload);
  }

  submit(id: string): Observable<ClaimDTO> {
    return this.http.post<ClaimDTO>(`${this.baseUrl}/${id}/submit`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  listDocuments(claimId: string): Observable<ClaimDocumentDTO[]> {
    return this.http.get<ClaimDocumentDTO[]>(`${API_CONFIG.baseUrl}/claim-documents/claims/${claimId}`);
  }

  uploadDocument(claimId: string, document: FormData): Observable<ClaimDocumentDTO> {
    return this.http.post<ClaimDocumentDTO>(`${API_CONFIG.baseUrl}/claim-documents/claims/${claimId}`, document);
  }

  deleteDocument(documentId: string): Observable<void> {
    return this.http.delete<void>(`${API_CONFIG.baseUrl}/claim-documents/${documentId}`);
  }
}
