import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PatientInfo {
  memberId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
}

export interface CoverageInfo {
  insurancePlanId?: string;
  groupNumber?: string;
  subscriberId?: string;
  relationshipToSubscriber?: string;
}

export interface CommunicationNote {
  authorId: string;
  authorRole: string;
  content: string;
  timestamp: string;
}

export interface AuthorizationRequest {
  id?: string;
  providerId: string;
  payerId: string;
  patientInfo: PatientInfo;
  diagnosisCodes: string[];
  procedureCodes: string[];
  serviceType?: string;
  urgency?: string;
  coverageInfo?: CoverageInfo;
  status?: string;
  aiConfidenceScore?: number;
  aiRecommendations?: string[];
  communicationNotes?: CommunicationNote[];
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AiReviewResponse {
  confidenceScore: number;
  suggestions: string[];
  requiresCorrection: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private apiUrl = `${environment.apiUrl}/authorizations`;

  constructor(private http: HttpClient) {}

  analyzeRequest(request: AuthorizationRequest): Observable<AiReviewResponse> {
    return this.http.post<AiReviewResponse>(`${this.apiUrl}/analyze`, request);
  }

  adjudicateRequest(id: string): Observable<AiReviewResponse> {
    return this.http.post<AiReviewResponse>(`${this.apiUrl}/${id}/adjudicate`, {});
  }

  createRequest(request: AuthorizationRequest): Observable<AuthorizationRequest> {
    return this.http.post<AuthorizationRequest>(this.apiUrl, request);
  }

  getRequestById(id: string): Observable<AuthorizationRequest> {
    return this.http.get<AuthorizationRequest>(`${this.apiUrl}/${id}`);
  }

  getRequestsByProvider(providerId: string, page = 0, size = 10): Observable<Page<AuthorizationRequest>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<AuthorizationRequest>>(`${this.apiUrl}/provider/${providerId}`, { params });
  }

  getRequestsByPayer(payerId: string, page = 0, size = 10): Observable<Page<AuthorizationRequest>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<AuthorizationRequest>>(`${this.apiUrl}/payer/${payerId}`, { params });
  }

  updateStatus(id: string, status: string): Observable<AuthorizationRequest> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<AuthorizationRequest>(`${this.apiUrl}/${id}/status`, null, { params });
  }

  addNote(id: string, authorId: string, authorRole: string, content: string): Observable<AuthorizationRequest> {
    return this.http.post<AuthorizationRequest>(`${this.apiUrl}/${id}/notes`, { authorId, authorRole, content });
  }
}
