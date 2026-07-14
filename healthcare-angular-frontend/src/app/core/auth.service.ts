import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { API_BASE_URL } from './api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = 'healthcare_jwt_token';

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(`${API_BASE_URL}/auth/register`, data, { responseType: 'text' });
  }

  login(data: any) {
  return this.http.post<any>(`${API_BASE_URL}/auth/login`, data)
    .pipe(
      tap((res: any) => {
        localStorage.setItem(this.key, res.token);
      })
    );
}

  token() { return localStorage.getItem(this.key); }
  isLoggedIn() { return !!this.token(); }
  logout() { localStorage.removeItem(this.key); }

  role(): string | null {
    const token = this.token();
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])).role || null; } catch { return null; }
  }

  username(): string | null {
    const token = this.token();
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1])).sub || null; } catch { return null; }
  }
}
