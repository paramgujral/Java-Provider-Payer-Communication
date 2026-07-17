import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface PayerPayload {
  payerCode: string;
  companyName: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export interface PayerResponse {
  id: number;
  payerCode: string;
  companyName: string;
  website: string;
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
export class PayerService {
  private api = environment.apiUrl + '/payer';

  constructor(private http: HttpClient) {}

  getPayers(): Observable<{ success: boolean; message: string; data: PayerResponse[] }> {
    return this.http.get<{ success: boolean; message: string; data: PayerResponse[] }>(this.api);
  }

  createPayer(payload: PayerPayload): Observable<{ success: boolean; message: string; data: PayerResponse }> {
    return this.http.post<{ success: boolean; message: string; data: PayerResponse }>(this.api, payload);
  }
}
