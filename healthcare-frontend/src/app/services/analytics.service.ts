import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProviderAnalytics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  approvalRate: number;
  statusBreakdown: { [key: string]: number };
  requestsByMonth: { [key: string]: number };
}

export interface PayerAnalytics {
  totalRequestsReceived: number;
  requestsPendingReview: number;
  requestsProcessed: number;
  averageAiConfidence: number;
  averageTurnaroundTimeHours: number;
  statusBreakdown: { [key: string]: number };
  urgencyBreakdown: { [key: string]: number };
  topProcedures: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getProviderAnalytics(providerId: string): Observable<ProviderAnalytics> {
    return this.http.get<ProviderAnalytics>(`${this.apiUrl}/provider/${providerId}`);
  }

  getPayerAnalytics(payerId: string): Observable<PayerAnalytics> {
    return this.http.get<PayerAnalytics>(`${this.apiUrl}/payer/${payerId}`);
  }
}
