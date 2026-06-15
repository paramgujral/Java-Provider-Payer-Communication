import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api-config';

export interface InsuranceClaimDTO {
  id: string;
  claimNumber: string;
  patientId: string;
  policyId: string;
  diseaseId: string;
  requestedAmount: number;
  approvedAmount?: number;
  status: string;
  healthcareRemarks?: string;
  insuranceRemarks?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class InsuranceReviewService {
  private http = inject(HttpClient);

  private readonly baseUrl = `${API_CONFIG.baseUrl}/claims`;

  listAll(): Observable<InsuranceClaimDTO[]> {
    return this.http.get<InsuranceClaimDTO[]>(this.baseUrl);
  }

  getById(id: string): Observable<InsuranceClaimDTO> {
    return this.http.get<InsuranceClaimDTO>(`${this.baseUrl}/${id}`);
  }

  approve(id: string, payload: { approvedAmount?: number; insuranceRemarks?: string }): Observable<InsuranceClaimDTO> {
    return this.http.put<InsuranceClaimDTO>(`${this.baseUrl}/${id}/approve`, payload);
  }

  reject(id: string, payload: { insuranceRemarks?: string }): Observable<InsuranceClaimDTO> {
    return this.http.put<InsuranceClaimDTO>(`${this.baseUrl}/${id}/reject`, payload);
  }

  submitForReview(id: string): Observable<InsuranceClaimDTO> {
    return this.http.post<InsuranceClaimDTO>(`${this.baseUrl}/${id}/submit`, {});
  }
}
