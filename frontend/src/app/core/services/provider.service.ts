import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface ProviderPayload {
  providerCode: string;
  hospitalName: string;
  specialization: string;
  licenseNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export interface ProviderResponse {
  id: number;
  providerCode: string;
  hospitalName: string;
  specialization: string;
  licenseNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  status: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private api = environment.apiUrl + '/provider';

  constructor(private http: HttpClient) {}

  getProviders(): Observable<{ success: boolean; message: string; data: ProviderResponse[] }> {
    return this.http.get<{ success: boolean; message: string; data: ProviderResponse[] }>(this.api);
  }

  createProvider(payload: ProviderPayload): Observable<{ success: boolean; message: string; data: ProviderResponse }> {
    return this.http.post<{ success: boolean; message: string; data: ProviderResponse }>(this.api, payload);
  }
}
