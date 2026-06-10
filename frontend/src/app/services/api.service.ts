import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AuthorizationRequest, CopilotReview, DecisionDto, AppNotification
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  // ---- Provider ----
  copilotReview(req: Partial<AuthorizationRequest>): Observable<CopilotReview> {
    return this.http.post<CopilotReview>(`${this.base}/provider/copilot/review`, req);
  }
  submit(req: Partial<AuthorizationRequest>): Observable<AuthorizationRequest> {
    return this.http.post<AuthorizationRequest>(`${this.base}/provider/requests`, req);
  }
  resubmit(id: number, addedNotes: string): Observable<AuthorizationRequest> {
    return this.http.post<AuthorizationRequest>(`${this.base}/provider/requests/${id}/resubmit`, { addedNotes });
  }

  // ---- Payer ----
  payerQueue(): Observable<AuthorizationRequest[]> {
    return this.http.get<AuthorizationRequest[]>(`${this.base}/payer/queue`);
  }
  decide(id: number, dto: DecisionDto): Observable<AuthorizationRequest> {
    return this.http.post<AuthorizationRequest>(`${this.base}/payer/requests/${id}/decision`, dto);
  }

  // ---- Tracking + FHIR ----
  allRequests(): Observable<AuthorizationRequest[]> {
    return this.http.get<AuthorizationRequest[]>(`${this.base}/requests`);
  }
  getRequest(id: number): Observable<AuthorizationRequest> {
    return this.http.get<AuthorizationRequest>(`${this.base}/requests/${id}`);
  }
  fhirBundle(id: number): Observable<any> {
    return this.http.get<any>(`${this.base}/requests/${id}/fhir`);
  }

  // ---- Notifications ----
  notifications(recipient: string): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.base}/notifications?recipient=${recipient}`);
  }
  unreadCount(recipient: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/notifications/unread-count?recipient=${recipient}`);
  }
  markAllRead(recipient: string): Observable<any> {
    return this.http.post(`${this.base}/notifications/read-all?recipient=${recipient}`, {});
  }
}
