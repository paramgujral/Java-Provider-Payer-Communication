import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api-config';

export interface InsuranceCompanyDTO {
  id?: string;
  companyName: string;
  email?: string;
  phone?: string;
  address?: string;
  active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class InsuranceCompanyService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/insurance-companies`;

  list(): Observable<InsuranceCompanyDTO[]> {
    return this.http.get<InsuranceCompanyDTO[]>(this.baseUrl);
  }

  get(id: string): Observable<InsuranceCompanyDTO> {
    return this.http.get<InsuranceCompanyDTO>(`${this.baseUrl}/${id}`);
  }

  create(payload: InsuranceCompanyDTO): Observable<InsuranceCompanyDTO> {
    return this.http.post<InsuranceCompanyDTO>(this.baseUrl, payload);
  }

  update(id: string, payload: InsuranceCompanyDTO): Observable<InsuranceCompanyDTO> {
    return this.http.put<InsuranceCompanyDTO>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
