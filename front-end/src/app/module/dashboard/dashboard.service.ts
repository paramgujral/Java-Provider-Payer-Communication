import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FHIR_BASE_URL, mapMeasureReportToDashboard } from '../../core/fhir/fhir.util';

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
export class DashboardAnalyticsService {
  private readonly apiBaseUrl = FHIR_BASE_URL;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http
      .get<any>(`${this.apiBaseUrl}/MeasureReport`)
      .pipe(map((resource) => mapMeasureReportToDashboard(resource)));
  }
}
