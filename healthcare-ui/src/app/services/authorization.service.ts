import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthorizationRequest } from '../models/authorization-request';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  private apiUrl = 'http://localhost:8080/api/request';

  constructor(private http: HttpClient) { }

  createRequest(request: AuthorizationRequest): Observable<AuthorizationRequest> {

    return this.http.post<AuthorizationRequest>(this.apiUrl, request);

  }

  getAllRequests(): Observable<AuthorizationRequest[]> {

    return this.http.get<AuthorizationRequest[]>(this.apiUrl);

  }

  approve(id: number): Observable<AuthorizationRequest> {

    return this.http.put<AuthorizationRequest>(`${this.apiUrl}/${id}/approve`, {});

  }

  reject(id: number): Observable<AuthorizationRequest> {

    return this.http.put<AuthorizationRequest>(`${this.apiUrl}/${id}/reject`, {});

  }
  // reviewRequest(request: AuthorizationRequest): Observable<string> {

  //   return this.http.post(
  //     `${this.apiUrl}/review`,
  //     request,
  //     { responseType: 'text' }
  //   );

  //}
  reviewRequest(request: AuthorizationRequest) {
    return this.http.post<any>(
      'http://localhost:8080/api/copilot/review',
      request
    );
  }
  deleteRequest(id: number) {

    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { responseType: 'text' }
    );

  }
  getFHIR(id: number) {

    return this.http.get(
      `${this.apiUrl}/${id}/fhir`,
      {
        responseType: 'text'
      }
    );

  }

  getReview(id: number) {

    return this.http.get(
      `${this.apiUrl}/${id}/review`,
      {
        responseType: 'text'
      }
    );

  }
}