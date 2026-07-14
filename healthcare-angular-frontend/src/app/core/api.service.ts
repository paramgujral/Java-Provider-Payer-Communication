import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  providers() { return this.http.get<any[]>(`${API_BASE_URL}/provider`); }
  createProvider(data: any) { return this.http.post<any>(`${API_BASE_URL}/provider`, data); }
  updateProvider(id: number, data: any) { return this.http.put<any>(`${API_BASE_URL}/provider/${id}`, data); }
  deleteProvider(id: number) { return this.http.delete(`${API_BASE_URL}/provider/${id}`, { responseType: 'text' }); }

  payers() { return this.http.get<any[]>(`${API_BASE_URL}/payer`); }
  createPayer(data: any) { return this.http.post<any>(`${API_BASE_URL}/payer`, data); }
  updatePayer(id: number, data: any) { return this.http.put<any>(`${API_BASE_URL}/payer/${id}`, data); }
  deletePayer(id: number) { return this.http.delete(`${API_BASE_URL}/payer/${id}`, { responseType: 'text' }); }

  authorizations() { return this.http.get<any[]>(`${API_BASE_URL}/authorization`); }
  createAuthorization(data: any) { return this.http.post<any>(`${API_BASE_URL}/authorization`, data); }
  submitAuth(id: number) { return this.http.put<any>(`${API_BASE_URL}/authorization/${id}/submit`, {}); }
  approveAuth(id: number, remarks: string) { return this.http.put<any>(`${API_BASE_URL}/authorization/${id}/approve`, { remarks }); }
  rejectAuth(id: number, remarks: string) { return this.http.put<any>(`${API_BASE_URL}/authorization/${id}/reject`, { remarks }); }

  aiReview(data: any) { return this.http.post<any>(`${API_BASE_URL}/ai/review`, data); }

  notifications() { return this.http.get<any[]>(`${API_BASE_URL}/notification`); }
  sendNotification(data: any) { return this.http.post<any>(`${API_BASE_URL}/notification/send`, data); }
}
