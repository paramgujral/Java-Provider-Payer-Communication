import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  fullName: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

  storeToken(res: LoginResponse) {
    if (!this.isBrowser()) return;
    localStorage.setItem('token', res.token);
    localStorage.setItem('role', res.role);
    localStorage.setItem('userId', String(res.userId));
    localStorage.setItem('fullName', res.fullName);
    localStorage.setItem('email', res.email);
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('role');
  }

  getFullName(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('fullName');
  }

  getUserId(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('userId');
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser()) return false;
    return !!this.getToken();
  }

  logout() {
    if (!this.isBrowser()) return;
    localStorage.clear();
  }
}
