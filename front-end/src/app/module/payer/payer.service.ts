import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

export interface PayerRequest {
  id: number;
  patientName: string;
  patientId: string;
  insuranceId: string;
  providerName: string;
  providerId: number;
  diagnosisCode: string;
  procedureCode: string;
  treatmentDescription: string;
  admissionDate: string;
  expectedDischargeDate: string;
  priority: string;
  status: string;
  rejectionReason: string;
  reviewNotes: string;
  createdAt: string;
  reviewedAt: string;
}

export interface ReviewPayload {
  decision: 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
  rejectionReason?: string;
}

@Injectable({ providedIn: 'root' })
export class PayerService {

  private http       = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl     = 'http://localhost:8080/api/payer';

  private getHeaders(): HttpHeaders {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('token') : null;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // GET pending requests (SUBMITTED + UNDER_REVIEW)
  getPendingRequests(): Observable<PayerRequest[]> {
    return this.http.get<PayerRequest[]>(
      `${this.apiUrl}/requests`,
      { headers: this.getHeaders() }
    );
  }

  // GET all requests
  getAllRequests(): Observable<PayerRequest[]> {
    return this.http.get<PayerRequest[]>(
      `${this.apiUrl}/requests/all`,
      { headers: this.getHeaders() }
    );
  }

  // PUT approve or reject
  reviewRequest(id: number, payload: ReviewPayload): Observable<PayerRequest> {
    return this.http.put<PayerRequest>(
      `${this.apiUrl}/requests/${id}/review`,
      payload,
      { headers: this.getHeaders() }
    );
  }
}
