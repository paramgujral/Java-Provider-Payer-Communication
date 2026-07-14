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

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // ================= LOGIN =================

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      { email, password }
    );
  }

  // ================= REGISTER =================

  register(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/register`,
      data
    );
  }

  // ================= STORE TOKEN =================

  storeToken(res: LoginResponse): void {
    if (!this.isBrowser()) return;

    localStorage.setItem('token', res.token);
    localStorage.setItem('role', res.role);
    localStorage.setItem('userId', String(res.userId));
    localStorage.setItem('fullName', res.fullName);
    localStorage.setItem('email', res.email);
  }

  // ================= GETTERS =================

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

  getEmail(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('email');
  }

  // ================= LOGIN STATUS =================

  isLoggedIn(): boolean {
    if (!this.isBrowser()) return false;
    return !!this.getToken();
  }

  // ================= ROLE HELPERS =================

  isProvider(): boolean {
    const role = this.getRole() || '';
    return role.replace('ROLE_', '').toUpperCase() === 'PROVIDER';
  }

  isPayer(): boolean {
    const role = this.getRole() || '';
    return role.replace('ROLE_', '').toUpperCase() === 'PAYER';
  }

  isAdmin(): boolean {
    const role = this.getRole() || '';
    return role.replace('ROLE_', '').toUpperCase() === 'ADMIN';
  }

  // ================= CURRENT USER =================

  getCurrentUser() {
    return {
      userId: this.getUserId(),
      fullName: this.getFullName(),
      email: this.getEmail(),
      role: this.getRole()
    };
  }

  // ================= LOGOUT =================

  logout(): void {
    if (!this.isBrowser()) return;

    localStorage.clear();
  }

}