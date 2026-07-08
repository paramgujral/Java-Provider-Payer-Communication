import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AuthorizationRequest,
  CreateRequestDto,
  ResponseDto,
  AiReview,
  Notification
} from '../models/request.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:8090/api';

  constructor(private http: HttpClient) {}

  // ─── Provider Endpoints ──────────────────────────────────────────────
  createRequest(data: CreateRequestDto): Observable<AuthorizationRequest> {
    return this.http.post<AuthorizationRequest>(`${this.baseUrl}/provider/request`, data);
  }

  submitRequest(id: number): Observable<AuthorizationRequest> {
    return this.http.put<AuthorizationRequest>(`${this.baseUrl}/provider/request/${id}/submit`, {});
  }

  getProviderRequests(): Observable<AuthorizationRequest[]> {
    return this.http.get<AuthorizationRequest[]>(`${this.baseUrl}/provider/requests`);
  }

  getAiReview(requestId: number): Observable<AiReview> {
    return this.http.get<AiReview>(`${this.baseUrl}/provider/request/${requestId}/ai-review`);
  }

  // ─── Payer Endpoints ──────────────────────────────────────────────────
  getPayerRequests(): Observable<AuthorizationRequest[]> {
    return this.http.get<AuthorizationRequest[]>(`${this.baseUrl}/payer/requests`);
  }

  respondToRequest(id: number, dto: ResponseDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/payer/request/${id}/response`, dto);
  }

  // ─── Notifications ────────────────────────────────────────────────────
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/notifications`);
  }
}