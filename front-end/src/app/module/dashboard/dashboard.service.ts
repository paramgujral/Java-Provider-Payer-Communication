import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

export interface StatusCount     { status: string; count: number; }
export interface MonthlyPriority { month: string; normal: number; urgent: number; emergency: number; }

export interface ProviderSummary {
  providerName: string;
  email: string;
  totalSubmitted: number;
  approved: number;
  rejected: number;
  pending: number;
}

export interface PayerSummary {
  payerName: string;
  email: string;
  totalReviewed: number;
  approved: number;
  rejected: number;
}

export interface DashboardStats {
  totalRequests: number;
  submitted: number;
  underReview: number;
  approved: number;
  rejected: number;
  statusDistribution: StatusCount[];
  monthlyByPriority: MonthlyPriority[];
  providerSummary: ProviderSummary[];
  payerSummary: PayerSummary[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http       = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl     = 'http://localhost:8080/api/dashboard';

  private getHeaders(): HttpHeaders {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('token') : null;
    return new HttpHeaders({ ...(token ? { Authorization: `Bearer ${token}` } : {}) });
  }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`, { headers: this.getHeaders() });
  }
}
