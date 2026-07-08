import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, UserInfo } from '../models/auth.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8090/api/auth';
  private userSubject = new BehaviorSubject<UserInfo | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      this.userSubject.next(JSON.parse(stored));
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('jwt', res.token);
        const userInfo: UserInfo = { username: credentials.username, role: res.role };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        this.userSubject.next(userInfo);
      })
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userInfo');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isProvider(): boolean {
    return this.userSubject.value?.role === 'PROVIDER';
  }

  isPayer(): boolean {
    return this.userSubject.value?.role === 'PAYER';
  }

  getRole(): string | null {
    return this.userSubject.value?.role || null;
  }
}