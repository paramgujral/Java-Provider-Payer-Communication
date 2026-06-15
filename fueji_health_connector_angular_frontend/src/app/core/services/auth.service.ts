import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, catchError, of, tap, map } from 'rxjs';
import { User, AuthResponse, LoginRequest, ChangePasswordRequest, ApiResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private isBrowser = false;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  public accessToken$ = this.accessTokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.currentUserSubject.next(this.getUserFromStorage());
      this.accessTokenSubject.next(this.getAccessTokenFromStorage());
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/login`, credentials).pipe(
      map((response) => {
        const raw = response.data;
        // Backend returns flat fields (userId, email, role, …); build nested User object
        const user: User = {
          id: raw.userId,
          email: raw.email,
          firstName: raw.firstName,
          lastName: raw.lastName,
          role: raw.role,
          organizationName: raw.organizationName,
          enabled: raw.status === 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return { accessToken: raw.accessToken, refreshToken: raw.refreshToken, user } as AuthResponse;
      }),
      tap((data: AuthResponse) => {
        this.setTokens(data.accessToken, data.refreshToken, data.user);
        this.currentUserSubject.next(data.user);
      })
    );
  }

  logout(): Observable<void> {
    this.clearTokens();
    this.currentUserSubject.next(null);
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      catchError(() => of(undefined as void))
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, request);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshTokenFromStorage();
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      map((response) => response.data),
      tap((data: AuthResponse) => {
        this.setTokens(data.accessToken, data.refreshToken, data.user);
        this.currentUserSubject.next(data.user);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getAccessToken(): string | null {
    return this.accessTokenSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken() && !!this.getCurrentUser();
  }

  hasRole(role: string | string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  }

  private setTokens(accessToken: string, refreshToken: string, user?: User): void {
    if (this.canUseLocalStorage()) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    }
    this.accessTokenSubject.next(accessToken);
  }

  private clearTokens(): void {
    if (this.canUseLocalStorage()) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
    }
    this.accessTokenSubject.next(null);
  }

  private getAccessTokenFromStorage(): string | null {
    return this.canUseLocalStorage() ? localStorage.getItem('accessToken') : null;
  }

  private getRefreshTokenFromStorage(): string | null {
    return this.canUseLocalStorage() ? localStorage.getItem('refreshToken') : null;
  }

  private getUserFromStorage(): User | null {
    if (!this.canUseLocalStorage()) {
      return null;
    }
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  private canUseLocalStorage(): boolean {
    return this.isBrowser && typeof localStorage !== 'undefined';
  }
}
