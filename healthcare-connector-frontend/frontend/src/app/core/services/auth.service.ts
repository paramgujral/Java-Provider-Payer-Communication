import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthUser } from '../models/authorization-request.model';

const STORAGE_KEY = 'hc_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.readStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  private readStoredUser(): AuthUser | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  login(username: string, password: string): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${environment.apiBaseUrl}/auth/login`, { username, password }).pipe(
      tap(user => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.currentUserSubject.next(null);
  }

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }
}
