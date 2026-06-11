import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthorizationRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PayerService {
  private readonly API_URL = `${environment.apiUrl}/payer/requests`;

  constructor(private http: HttpClient) { }

  /**
   * Get all authorization requests for payer
   */
  getRequests(): Observable<AuthorizationRequest[]> {
    return this.http.get<AuthorizationRequest[]>(this.API_URL + '/all');
  }

  /**
   * Get single authorization request
   */
  getRequestById(requestId: string): Observable<AuthorizationRequest> {
    return this.http.get<AuthorizationRequest>(`${this.API_URL}/${requestId}`);
  }

  /**
   * Approve authorization request
   */
  approveRequest(requestId: string): Observable<AuthorizationRequest> {
    return this.http.post<AuthorizationRequest>(`${this.API_URL}/${requestId}/approve`, {});
  }

  /**
   * Reject authorization request
   */
  rejectRequest(requestId: string, reason: string): Observable<AuthorizationRequest> {
    return this.http.post<AuthorizationRequest>(`${this.API_URL}/${requestId}/reject`, { reason });
  }

  /**
   * Request additional information
   */
  requestAdditionalInfo(requestId: string, requiredInfo: string): Observable<AuthorizationRequest> {
    return this.http.post<AuthorizationRequest>(`${this.API_URL}/${requestId}/additional-info`, { requiredInfo });
  }
}
