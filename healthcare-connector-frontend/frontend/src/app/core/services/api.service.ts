import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppNotification, AuthorizationRequest, ValidationResult } from '../models/authorization-request.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private authHeaders(): HttpHeaders {
    const token = this.auth.currentUser?.token ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Provider: validate form data with the (currently rule-based) AI Copilot before submission
  validateRequest(request: AuthorizationRequest): Observable<ValidationResult> {
    return this.http.post<ValidationResult>(`${this.base}/provider/validate`, request, {
      headers: this.authHeaders()
    });
  }

  // Provider: submit a validated authorization request
  submitRequest(request: AuthorizationRequest): Observable<AuthorizationRequest> {
    return this.http.post<AuthorizationRequest>(`${this.base}/provider/requests`, request, {
      headers: this.authHeaders()
    });
  }

  // Provider: list my submitted requests
  getMyRequests(): Observable<AuthorizationRequest[]> {
    return this.http.get<AuthorizationRequest[]>(`${this.base}/provider/requests`, {
      headers: this.authHeaders()
    });
  }

  // Payer: list incoming requests (pending/all)
  getIncomingRequests(): Observable<AuthorizationRequest[]> {
    return this.http.get<AuthorizationRequest[]>(`${this.base}/payer/requests`, {
      headers: this.authHeaders()
    });
  }

  // Payer: accept or reject a request
  decideRequest(id: number, decision: 'APPROVED' | 'REJECTED', notes: string): Observable<AuthorizationRequest> {
    return this.http.post<AuthorizationRequest>(`${this.base}/payer/requests/${id}/decision`, { decision, notes }, {
      headers: this.authHeaders()
    });
  }

  // Notifications for the dashboard bell / list
  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.base}/notifications`, {
      headers: this.authHeaders()
    });
  }

  markNotificationRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/notifications/${id}/read`, {}, {
      headers: this.authHeaders()
    });
  }
}
