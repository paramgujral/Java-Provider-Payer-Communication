import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthorizationRequest, CreateAuthorizationRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private apiUrl = `${environment.apiUrl}/api/authorizations`;

  constructor(private http: HttpClient) {}

  createAuthorizationRequest(request: CreateAuthorizationRequest): Observable<AuthorizationRequest> {
    return this.http.post<AuthorizationRequest>(this.apiUrl, request);
  }

  getAuthorizationRequests(): Observable<AuthorizationRequest[]> {
    return this.http.get<AuthorizationRequest[]>(this.apiUrl);
  }

  getAuthorizationRequestById(id: string): Observable<AuthorizationRequest> {
    return this.http.get<AuthorizationRequest>(`${this.apiUrl}/${id}`);
  }

  approveAuthorization(id: string, notes: string): Observable<AuthorizationRequest> {
    return this.http.put<AuthorizationRequest>(`${this.apiUrl}/${id}/approve`, { approvalNotes: notes });
  }

  denyAuthorization(id: string, reason: string): Observable<AuthorizationRequest> {
    return this.http.put<AuthorizationRequest>(`${this.apiUrl}/${id}/deny`, { denialReason: reason });
  }

  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics`);
  }
}
