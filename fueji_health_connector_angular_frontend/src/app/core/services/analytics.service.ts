import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/api/analytics`;

  constructor(private http: HttpClient) {}

  getDashboardMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  getAuthorizationStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/authorizations`);
  }

  getProviderStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/providers`);
  }

  getPayerStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/payers`);
  }

  getUserActivity(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user-activity`);
  }
}
