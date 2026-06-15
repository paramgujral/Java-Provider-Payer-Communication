import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  orgAdmin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // Track auth state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.handleAuthentication(res))
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData, { responseType: 'text' });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data, { responseType: 'text' });
  }

  registerByAdmin(userData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/admin/users`, userData);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('organizationId');
    localStorage.removeItem('userName');
    localStorage.removeItem('email');
    localStorage.removeItem('orgAdmin');
    this.isAuthenticatedSubject.next(false);
  }

  private handleAuthentication(res: AuthResponse) {
    localStorage.setItem('token', res.token);
    // Lowercase the role since the app previously expected 'provider' or 'payer'
    localStorage.setItem('role', res.role.toLowerCase());
    // Store organizationId as userId to keep existing components happy
    localStorage.setItem('userId', res.organizationId); 
    localStorage.setItem('organizationId', res.organizationId);
    localStorage.setItem('userName', `${res.firstName} ${res.lastName}`);
    localStorage.setItem('email', res.email);
    localStorage.setItem('orgAdmin', res.orgAdmin ? 'true' : 'false');
    this.isAuthenticatedSubject.next(true);
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  public hasToken(): boolean {
    return !!this.getToken();
  }
}
