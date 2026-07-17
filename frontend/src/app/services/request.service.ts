import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  private apiUrl = 'http://localhost:8081/fhir/Claim';

  constructor(private http: HttpClient) {}

  createRequest(request: any): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }

  getAllRequests(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  approveRequest(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectRequest(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/reject`, {});
  }
}