import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, ApiResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'hc_token';
  private readonly USER_KEY  = 'hc_user';

  // Signals for reactive state
  private _currentUser = signal<AuthResponse | null>(this.loadUser());
  private _loading     = signal(false);

  readonly currentUser  = this._currentUser.asReadonly();
  readonly isLoggedIn   = computed(() => !!this._currentUser());
  readonly isProvider   = computed(() => this._currentUser()?.role === 'PROVIDER');
  readonly isPayer      = computed(() => this._currentUser()?.role === 'PAYER');
  readonly loading      = this._loading.asReadonly();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this._loading.set(true);
    return this.http
      .post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        map(res => res.data),
        tap(user => {
          this.persistSession(user);
          this._currentUser.set(user);
          this._loading.set(false);
          this.redirectAfterLogin(user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  refreshCurrentUser(): Observable<AuthResponse> {
    return this.http
      .get<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/me`)
      .pipe(
        map(res => res.data),
        tap(user => {
          this.persistSession({ ...user, token: this.getToken()! });
          this._currentUser.set({ ...user, token: this.getToken()! });
        })
      );
  }

  private persistSession(user: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, user.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private loadUser(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private redirectAfterLogin(user: AuthResponse): void {
    const redirect = user.role === 'PROVIDER'
      ? '/provider/dashboard'
      : '/payer/dashboard';
    this.router.navigate([redirect]);
  }
}
