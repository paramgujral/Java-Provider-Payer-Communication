import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthorizationRequest } from '../models/authorization-request.model';
import { 
  ProviderDashboardStats, 
  PayerDashboardStats 
} from '../models/dashboard.model';
import { environment } from '../../../environments/environment';
import { AIValidationResponse } from '../models/ai-validation.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PayerLookup {
  id: number;
  name: string;
  organizationName: string;
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private readonly baseUrl = `${environment.apiUrl}/requests`;
  private readonly aiUrl = `${environment.apiUrl}/ai`; // Sprint 3 endpoint

  constructor(private http: HttpClient) {}

  getProviderDashboard(): Observable<ApiResponse<ProviderDashboardStats>> {
    return this.http.get<ApiResponse<ProviderDashboardStats>>(`${this.baseUrl}/dashboard/provider`);
  }

  getPayerDashboard(): Observable<ApiResponse<PayerDashboardStats>> {
    return this.http.get<ApiResponse<PayerDashboardStats>>(`${this.baseUrl}/dashboard/payer`);
  }

  getPayers(): Observable<ApiResponse<PayerLookup[]>> {
    return this.http.get<ApiResponse<PayerLookup[]>>(`${this.baseUrl}/payers`);
  }

  createRequest(request: AuthorizationRequest): Observable<ApiResponse<AuthorizationRequest>> {
    return this.http.post<ApiResponse<AuthorizationRequest>>(`${this.baseUrl}`, request);
  }

  updateRequest(id: number, request: AuthorizationRequest): Observable<ApiResponse<AuthorizationRequest>> {
    return this.http.put<ApiResponse<AuthorizationRequest>>(`${this.baseUrl}/${id}`, request);
  }

  getRequestDetails(id: number): Observable<ApiResponse<AuthorizationRequest>> {
    return this.http.get<ApiResponse<AuthorizationRequest>>(`${this.baseUrl}/${id}`);
  }

  getProviderRequests(): Observable<ApiResponse<AuthorizationRequest[]>> {
    return this.http.get<ApiResponse<AuthorizationRequest[]>>(`${this.baseUrl}/provider`);
  }

  getPayerRequests(): Observable<ApiResponse<AuthorizationRequest[]>> {
    return this.http.get<ApiResponse<AuthorizationRequest[]>>(`${this.baseUrl}/payer`);
  }

  updateRequestStatus(id: number, status: string, remarks?: string): Observable<ApiResponse<AuthorizationRequest>> {
    let params = new HttpParams().set('status', status);
    if (remarks) {
      params = params.set('remarks', remarks);
    }
    return this.http.put<ApiResponse<AuthorizationRequest>>(`${this.baseUrl}/${id}/status`, {}, { params });
  }

  uploadDocument(requestId: number, file: File): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/${requestId}/documents`, formData);
  }

  // To be integrated in Sprint 3 with Gemini API
  validateWithAI(requestData: any): Observable<ApiResponse<AIValidationResponse>> {
    return this.http.post<ApiResponse<AIValidationResponse>>(`${this.aiUrl}/validate`, requestData);
  }
}
