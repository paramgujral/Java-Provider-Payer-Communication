import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  email: string;
  phone: string;
  fhirId: string;
}

export interface Coverage {
  id: number;
  patient: Patient;
  subscriberId: string;
  beneficiaryId: string;
  status: string;
  payerName: string;
  planDetails: string;
  fhirId: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthorizationRequest {
  id: number;
  patient: Patient;
  provider: User;
  payer?: User;
  coverage: Coverage;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'INFO_REQUIRED' | 'APPROVED' | 'REJECTED';
  diagnosisCode: string;
  diagnosisDescription?: string;
  treatmentCode: string;
  treatmentDescription?: string;
  notes?: string;
  fhirResource: string;
  confidenceScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistory {
  id: number;
  status: string;
  notes: string;
  updatedBy: User;
  createdAt: string;
}

export interface Message {
  id: number;
  requestId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

export interface AIReviewResult {
  confidenceScore: number;
  statusValidation: boolean;
  issues: string[];
  recommendations: string[];
}

export interface NotificationResponse {
  notifications: Array<{
    id: number;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Authentication
  login(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, payload);
  }

  // Patients & Coverages
  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.baseUrl}/patients`);
  }

  getCoveragesForPatient(patientId: number): Observable<Coverage[]> {
    return this.http.get<Coverage[]>(`${this.baseUrl}/patients/${patientId}/coverages`);
  }

  // Authorization Requests
  getRequestsForProvider(providerId: number): Observable<AuthorizationRequest[]> {
    return this.http.get<AuthorizationRequest[]>(`${this.baseUrl}/provider/requests`, {
      params: new HttpParams().set('providerId', providerId.toString())
    });
  }

  getRequestsForPayer(): Observable<AuthorizationRequest[]> {
    return this.http.get<AuthorizationRequest[]>(`${this.baseUrl}/payer/requests`);
  }

  getRequestDetails(id: number): Observable<{
    request: AuthorizationRequest;
    history: StatusHistory[];
    messages: Message[];
  }> {
    return this.http.get<{
      request: AuthorizationRequest;
      history: StatusHistory[];
      messages: Message[];
    }>(`${this.baseUrl}/authorization/${id}`);
  }

  createRequest(dto: any): Observable<AuthorizationRequest> {
    return this.http.post<AuthorizationRequest>(`${this.baseUrl}/authorization`, dto);
  }

  updateRequest(id: number, dto: any): Observable<AuthorizationRequest> {
    return this.http.put<AuthorizationRequest>(`${this.baseUrl}/authorization/${id}`, dto);
  }

  // Payer Actions
  approveRequest(requestId: number, note: string, userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/payer/approve`, { requestId, note, userId });
  }

  rejectRequest(requestId: number, note: string, userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/payer/reject`, { requestId, note, userId });
  }

  requestMoreInfo(requestId: number, note: string, userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/payer/request-info`, { requestId, note, userId });
  }

  // AI Copilot
  reviewRequest(dto: any): Observable<AIReviewResult> {
    return this.http.post<AIReviewResult>(`${this.baseUrl}/ai/review`, dto);
  }

  // Notifications
  getNotifications(userId: number): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${this.baseUrl}/notifications`, {
      params: new HttpParams().set('userId', userId.toString())
    });
  }

  markAllNotificationsRead(userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/notifications/read-all`, null, {
      params: new HttpParams().set('userId', userId.toString())
    });
  }

  markNotificationRead(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/notifications/${id}/read`, null);
  }

  // Bidirectional Chat
  getMessages(id: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/authorization/${id}/messages`);
  }

  sendMessage(id: number, senderId: number, message: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/authorization/${id}/messages`, { message }, {
      params: new HttpParams().set('senderId', senderId.toString())
    });
  }
}
