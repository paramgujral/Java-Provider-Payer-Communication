import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'PROVIDER' | 'PAYER';
  enabled: boolean;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  fullName: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserCreationService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/auth';

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/register`,
      payload
    );
  }
}
