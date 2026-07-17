import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface AuthorizationUploadPayload {
  requestNumber: string;
  providerId: number;
  payerId: number;
  patientName: string;
  patientDob: string;
  patientGender: string;
  patientPhone: string;
  patientAddress: string;
  insuranceCompany: string;
  policyNumber: string;
  memberId: string;
  coverageType: string;
  doctorName: string;
  npiNumber: string;
  hospital: string;
  specialty: string;
  diagnosis: string;
  icd10Code: string;
  procedureName: string;
  cptCode: string;
  reasonForAuthorization: string;
  mriReport: string;
  labReport: string;
  prescription: string;
  medicalHistory: string;
  payload: string;
}

export interface AuthorizationDecisionPayload {
  status: string;
  reason?: string;
}

export interface AuthorizationResponse {
  id: number;
  requestNumber: string;
  providerId: number;
  payerId: number;
  patientName: string;
  patientDob: string;
  patientGender: string;
  patientPhone: string;
  patientAddress: string;
  insuranceCompany: string;
  policyNumber: string;
  memberId: string;
  coverageType: string;
  doctorName: string;
  npiNumber: string;
  hospital: string;
  specialty: string;
  diagnosis: string;
  icd10Code: string;
  procedureName: string;
  cptCode: string;
  reasonForAuthorization: string;
  mriReport: string;
  labReport: string;
  prescription: string;
  medicalHistory: string;
  status: string;
  fhirValid: boolean;
  aiScore: number | null;
  aiMissing: string[];
  aiWarnings: string[];
  decisionReason: string | null;
  patientResourceJson: string | null;
  coverageResourceJson: string | null;
  practitionerResourceJson: string | null;
  claimResourceJson: string | null;
  documentReferenceResourceJson: string | null;
  claimResponseResourceJson: string | null;
  submittedAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthorizationService {
  private api = environment.apiUrl + '/authorization';

  constructor(private http: HttpClient) {}

  upload(payload: AuthorizationUploadPayload): Observable<any> {
    return this.saveDraft(payload);
  }

  saveDraft(payload: AuthorizationUploadPayload): Observable<{ success: boolean; message: string; data: AuthorizationResponse }> {
    return this.http.post<{ success: boolean; message: string; data: AuthorizationResponse }>(this.api + '/draft', payload);
  }

  submit(id: number): Observable<{ success: boolean; message: string; data: AuthorizationResponse }> {
    return this.http.post<{ success: boolean; message: string; data: AuthorizationResponse }>(`${this.api}/${id}/submit`, {});
  }

  list(): Observable<{ success: boolean; message: string; data: AuthorizationResponse[] }> {
    return this.http.get<{ success: boolean; message: string; data: AuthorizationResponse[] }>(this.api);
  }

  listPayerQueue(): Observable<{ success: boolean; message: string; data: AuthorizationResponse[] }> {
    return this.http.get<{ success: boolean; message: string; data: AuthorizationResponse[] }>(environment.apiUrl + '/payer/requests');
  }

  updateStatus(id: number, status: string): Observable<{ success: boolean; message: string; data: AuthorizationResponse }> {
    return this.http.put<{ success: boolean; message: string; data: AuthorizationResponse }>(`${this.api}/${id}?status=${encodeURIComponent(status)}`, {});
  }

  getById(id: number): Observable<{ success: boolean; message: string; data: AuthorizationResponse }> {
    return this.http.get<{ success: boolean; message: string; data: AuthorizationResponse }>(`${this.api}/${id}`);
  }

  decide(id: number, payload: AuthorizationDecisionPayload): Observable<{ success: boolean; message: string; data: AuthorizationResponse }> {
    return this.http.put<{ success: boolean; message: string; data: AuthorizationResponse }>(`${this.api}/${id}/decision`, payload);
  }

  saveAiReview(id: number, payload: unknown): Observable<{ success: boolean; message: string; data: AuthorizationResponse }> {
    return this.http.put<{ success: boolean; message: string; data: AuthorizationResponse }>(`${this.api}/${id}/ai-review`, payload);
  }
}
