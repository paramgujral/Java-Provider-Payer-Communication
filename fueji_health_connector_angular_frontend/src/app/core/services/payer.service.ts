import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PayerService {
  private apiUrl = `${environment.apiUrl}/api/payers`;

  constructor(private http: HttpClient) {}

  createPayer(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, request);
  }

  getPayers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getPayerById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updatePayer(id: string, request: Partial<CreateUserRequest>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, request);
  }

  deletePayer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPayerProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }
}
