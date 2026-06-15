import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api-config';

export interface HealthcareStats {
  totalPatients: number;
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
}

export interface InsuranceStats {
  receivedClaims: number;
  underReviewClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  averageClaimAmount: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  getHealthcareStats(): Observable<HealthcareStats> {
    return this.http.get<HealthcareStats>(`${API_CONFIG.baseUrl}/dashboard/healthcare`);
  }

  getInsuranceStats(): Observable<InsuranceStats> {
    return this.http.get<InsuranceStats>(`${API_CONFIG.baseUrl}/dashboard/insurance`);
  }
}
