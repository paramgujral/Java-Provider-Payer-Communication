import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../models/user.model';

export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  organizationName: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  private loadCurrentUser(): void {
    const token = this.getToken();
    if (token) {
      const decoded = this.decodeToken(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        this.currentUserSubject.next({
          id: decoded.userId,
          email: decoded.sub,
          name: decoded.sub.split('@')[0], // Fallback name
          role: decoded.role as UserRole,
          organizationName: decoded.organizationName,
          emailVerified: true
        });
      } else {
        this.logout();
      }
    }
  }

  register(request: any): Observable<any> {
    return this.http.post(`${this.authUrl}/register`, request);
  }

  verifyOtp(request: { email: string; otp: string }): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/verify-otp`, request).pipe(
      map(res => {
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data);
        }
        return res;
      })
    );
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${this.authUrl}/resend-otp?email=${encodeURIComponent(email)}`, {});
  }

  login(request: any): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/login`, request).pipe(
      map(res => {
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data);
        }
        return res;
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.authUrl}/forgot-password`, { email });
  }

  resetPassword(request: any): Observable<any> {
    return this.http.post(`${this.authUrl}/reset-password`, request);
  }

  private handleAuthSuccess(authData: AuthResponse): void {
    localStorage.setItem('auth_token', authData.token);
    this.currentUserSubject.next({
      id: authData.id,
      name: authData.name,
      email: authData.email,
      role: authData.role,
      organizationName: authData.organizationName,
      emailVerified: true
    });
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const decoded = this.decodeToken(token);
    return decoded ? decoded.exp * 1000 > Date.now() : false;
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserValue;
    return user ? user.role === role : false;
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }
}
