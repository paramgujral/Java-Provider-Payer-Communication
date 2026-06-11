import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthorizationRequest,
  CreateAuthorizationRequest,
  UpdateAuthorizationRequest,
  CopilotRecommendation
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  private readonly API_URL = `${environment.apiUrl}/provider/requests`;

  constructor(private http: HttpClient) { }

  /**
   * Get all authorization requests for provider
   */
  getRequests(): Observable<AuthorizationRequest[]> {
    return this.http.get<AuthorizationRequest[]>(this.API_URL + '/all');
  }

  /**
   * Get single authorization request
   */
getRequestById(requestId: string): Observable<AuthorizationRequest> {
  return this.http.get<AuthorizationRequest>(
    `${this.API_URL}/get?requestId=${requestId}`
  );
}

  /**
   * Create new authorization request
   */
  createRequest(request: CreateAuthorizationRequest): Observable<AuthorizationRequest> {
    return this.http.post<AuthorizationRequest>(this.API_URL, request);
  }

  /**
   * Update authorization request
   */
  updateRequest(
  requestId: number,
  updates: UpdateAuthorizationRequest
): Observable<AuthorizationRequest> {

  return this.http.put<AuthorizationRequest>(
    `${this.API_URL}/${requestId}`,
    updates
  );
}

  /**
   * Submit authorization request
   */
  submitRequest(requestId: string): Observable<AuthorizationRequest> {
    return this.http.post<AuthorizationRequest>(`${this.API_URL}/${requestId}/submit`, {});
  }

  /**
   * Get AI Copilot recommendations
   */
  getCopilotRecommendations(requestId: string): Observable<CopilotRecommendation> {
    return this.http.get<CopilotRecommendation>(`${this.API_URL}/${requestId}/recommendations`);
  }
}
