import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface SubmitRequestPayload {
  patientName: string;
  patientId: string;
  insuranceId: string;
  diagnosisCode: string;
  procedureCode: string;
  treatmentDescription: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  priority: string;
}

export interface AuthRequestResponse {
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

// Payload now includes fieldName + fieldValue for per-field suggestions
export interface SuggestionPayload {
  fieldName: string;
  fieldValue: string;
  diagnosisCode: string;
  procedureCode: string;
  treatmentDescription: string;
}

export interface SuggestionResponse {
  suggestion: string;
}

@Injectable({ providedIn: 'root' })
export class ProviderService {

  private http       = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl     = 'http://localhost:8080/api/provider';

  private getToken(): string | null {
    return isPlatformBrowser(this.platformId)
      ? localStorage.getItem('token')
      : null;
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  submitRequest(payload: SubmitRequestPayload): Observable<AuthRequestResponse> {
    return this.http.post<AuthRequestResponse>(
      `${this.apiUrl}/requests`, payload,
      { headers: this.getHeaders() }
    );
  }

  getMyRequests(): Observable<AuthRequestResponse[]> {
    return this.http.get<AuthRequestResponse[]>(
      `${this.apiUrl}/requests`,
      { headers: this.getHeaders() }
    );
  }

  /** Per-field suggestion — sends field name/value + form context */
  getFieldSuggestion(payload: SuggestionPayload): Observable<SuggestionResponse> {
    return this.http.post<SuggestionResponse>(
      `${this.apiUrl}/suggest`, payload,
      { headers: this.getHeaders() }
    );
  }
}
