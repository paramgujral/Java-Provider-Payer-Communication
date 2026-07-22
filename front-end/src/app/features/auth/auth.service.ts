import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { FHIR_BASE_URL, getParameterValue } from '../../core/fhir/fhir.util';

export interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  fullName: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class SessionAuthService {
  private readonly apiBaseUrl = FHIR_BASE_URL;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  authenticateUser(email: string, password: string): Observable<LoginResponse> {
    const body = {
      resourceType: 'Parameters',
      parameter: [
        { name: 'email', valueString: email },
        { name: 'password', valueString: password }
      ]
    };
    return this.http.post<any>(`${this.apiBaseUrl}/login`, body).pipe(
      map((parameters) => ({
        token: String(getParameterValue(parameters, 'token') || ''),
        userId: Number(getParameterValue(parameters, 'userId') || 0),
        email: String(getParameterValue(parameters, 'email') || ''),
        fullName: String(getParameterValue(parameters, 'fullName') || ''),
        role: String(getParameterValue(parameters, 'role') || '')
      }))
    );
  }

  persistSession(authResponse: LoginResponse): void {
    if (!this.isBrowser()) return;
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('role', authResponse.role);
    localStorage.setItem('userId', String(authResponse.userId));
    localStorage.setItem('fullName', authResponse.fullName);
    localStorage.setItem('email', authResponse.email);
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

  getEmail(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('email');
  }

  getUserId(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('userId');
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser()) return false;
    return !!this.getToken();
  }

  clearSession(): void {
    if (!this.isBrowser()) return;
    localStorage.clear();
  }
}
