import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  private apiUrl = `${environment.apiUrl}/api/providers`;

  constructor(private http: HttpClient) {}

  createProvider(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, request);
  }

  getProviders(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getProviderById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateProvider(id: string, request: Partial<CreateUserRequest>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, request);
  }

  deleteProvider(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getProviderProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }
}
