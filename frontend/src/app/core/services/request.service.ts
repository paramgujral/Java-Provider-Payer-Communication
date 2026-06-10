import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, AuthorizationRequest, CreateAuthorizationRequest,
  ResubmitRequest, ReviewDecisionRequest, ProviderDashboard,
  PayerDashboard, AiAnalysis, AuditLog, RequestStatus
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private base = `${environment.apiUrl}/requests`;

  constructor(private http: HttpClient) {}

  // ── Provider ──────────────────────────────────────────────────────────────

  createRequest(dto: CreateAuthorizationRequest): Observable<AuthorizationRequest> {
    return this.http.post<ApiResponse<AuthorizationRequest>>(this.base, dto)
      .pipe(map(r => r.data));
  }

  getMyRequests(status?: RequestStatus, search?: string): Observable<AuthorizationRequest[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<AuthorizationRequest[]>>(this.base, { params })
      .pipe(map(r => r.data));
  }

  submitRequest(id: number): Observable<AuthorizationRequest> {
    return this.http.post<ApiResponse<AuthorizationRequest>>(`${this.base}/${id}/submit`, {})
      .pipe(map(r => r.data));
  }

  resubmitRequest(id: number, dto: ResubmitRequest): Observable<AuthorizationRequest> {
    return this.http.post<ApiResponse<AuthorizationRequest>>(`${this.base}/${id}/resubmit`, dto)
      .pipe(map(r => r.data));
  }

  getProviderDashboard(): Observable<ProviderDashboard> {
    return this.http.get<ApiResponse<ProviderDashboard>>(`${this.base}/dashboard`)
      .pipe(map(r => r.data));
  }

  // ── Payer ─────────────────────────────────────────────────────────────────

  getQueue(status?: RequestStatus, search?: string): Observable<AuthorizationRequest[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<AuthorizationRequest[]>>(`${this.base}/queue`, { params })
      .pipe(map(r => r.data));
  }

  startReview(id: number): Observable<AuthorizationRequest> {
    return this.http.post<ApiResponse<AuthorizationRequest>>(`${this.base}/${id}/review/start`, {})
      .pipe(map(r => r.data));
  }

  processDecision(id: number, dto: ReviewDecisionRequest): Observable<AuthorizationRequest> {
    return this.http.post<ApiResponse<AuthorizationRequest>>(`${this.base}/${id}/review/decision`, dto)
      .pipe(map(r => r.data));
  }

  getPayerDashboard(): Observable<PayerDashboard> {
    return this.http.get<ApiResponse<PayerDashboard>>(`${this.base}/payer/dashboard`)
      .pipe(map(r => r.data));
  }

  // ── Shared ────────────────────────────────────────────────────────────────

  getRequestById(id: number): Observable<AuthorizationRequest> {
    return this.http.get<ApiResponse<AuthorizationRequest>>(`${this.base}/${id}`)
      .pipe(map(r => r.data));
  }

  getRequestsByStatus(status: RequestStatus): Observable<AuthorizationRequest[]> {
    return this.http.get<ApiResponse<AuthorizationRequest[]>>(`${this.base}/status/${status}`)
      .pipe(map(r => r.data));
  }

  getAiAnalysis(id: number): Observable<AiAnalysis> {
    return this.http.get<ApiResponse<AiAnalysis>>(`${this.base}/${id}/ai-analysis`)
      .pipe(map(r => r.data));
  }

  getAuditTimeline(id: number): Observable<AuditLog[]> {
    return this.http.get<ApiResponse<AuditLog[]>>(`${this.base}/${id}/audit`)
      .pipe(map(r => r.data));
  }
}
