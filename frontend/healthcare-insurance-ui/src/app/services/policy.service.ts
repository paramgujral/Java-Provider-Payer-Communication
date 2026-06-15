import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api-config';

export interface InsurancePolicyDTO {
  id?: string;
  policyNumber: string;
  coverageAmount: number;
  startDate?: string;
  endDate?: string;
  patientId: string;
  insuranceCompanyId: string;
}

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/policies`;

  listAll(): Observable<InsurancePolicyDTO[]> {
    return this.http.get<InsurancePolicyDTO[]>(this.baseUrl);
  }

  getById(id: string): Observable<InsurancePolicyDTO> {
    return this.http.get<InsurancePolicyDTO>(`${this.baseUrl}/${id}`);
  }

  create(payload: InsurancePolicyDTO): Observable<InsurancePolicyDTO> {
    return this.http.post<InsurancePolicyDTO>(this.baseUrl, payload);
  }

  update(id: string, payload: InsurancePolicyDTO): Observable<InsurancePolicyDTO> {
    return this.http.put<InsurancePolicyDTO>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
