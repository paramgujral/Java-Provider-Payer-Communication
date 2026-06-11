import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CurrentUser,
  LoginRequest,
  LoginResponse,
  Notification,
  NotificationType,
  UserRole
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private readonly API_URL = `${environment.LOGIN_REQUEST}`;
  private readonly STORAGE_KEY_TOKEN = 'auth_token';
  private readonly STORAGE_KEY_USER = 'current_user';

  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(
    this.getUserFromStorage()
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.getTokenFromStorage() !== null
  );
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadNotificationCountSubject = new BehaviorSubject<number>(0);
  public unreadNotificationCount$ = this.unreadNotificationCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // this.loadInitialNotifications();
  }

  /**
   * Login user with credentials
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}`, credentials).pipe(
      tap((response) => {
        this.setCurrentUser(response);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY_TOKEN);
    localStorage.removeItem(this.STORAGE_KEY_USER);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.notificationsSubject.next([]);
  }

  /**
   * Set current user after successful login
   */
  private setCurrentUser(response: LoginResponse): void {
    const user: CurrentUser = {
      token: response.token,
      username: response.username,
      role: response.role,
      roleId: response.roleId,
      userId: response.userId
    };
    localStorage.setItem(this.STORAGE_KEY_TOKEN, response.token);
    localStorage.setItem(this.STORAGE_KEY_USER, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Get current user from storage
   */
  private getUserFromStorage(): CurrentUser | null {
    const userJson = localStorage.getItem(this.STORAGE_KEY_USER);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Get token from storage
   */
  getTokenFromStorage(): string | null {
    return localStorage.getItem(this.STORAGE_KEY_TOKEN);
  }

  /**
   * Get current user
   */
  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole | string): boolean {
    const currentUser = this.getCurrentUser();
    console.log(currentUser);
    
    return currentUser ? currentUser.role === role : false;
  }

  /**
   * Get notifications
   */
  getNotifications(): Observable<Notification[]> {
    console.log(this.getCurrentUser());
    
    return this.http.get<Notification[]>(`${environment.apiUrl}/notifications?userId=${this.getCurrentUser()?.userId}`);
  }

  /**
   * Add new notification
   */
  addNotification(notification: Notification): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current]);
    this.updateUnreadCount();
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): void {
    this.http.patch(`${environment.apiUrl}/notifications/${notificationId}`, { read: true }).subscribe(() => {
      const notifications = this.notificationsSubject.value.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      this.notificationsSubject.next(notifications);
      this.updateUnreadCount();
    });
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    this.http.delete(`${environment.apiUrl}/notifications`).subscribe(() => {
      this.notificationsSubject.next([]);
      this.updateUnreadCount();
    });
  }

  /**
   * Get unread notification count
   */
  getUnreadNotificationCount(): number {
    return this.unreadNotificationCountSubject.value;
  }

  /**
   * Update unread notification count
   */
  private updateUnreadCount(): void {
    const count = this.notificationsSubject.value.filter((n) => !n.read).length;
    this.unreadNotificationCountSubject.next(count);
  }

  /**
   * Load initial notifications (simulated)
   */
  private loadInitialNotifications(): void {
    this.getNotifications().subscribe({
      next: (notifications) => {
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      },
      error: () => {
        this.notificationsSubject.next([]);
      }
    });
  }
}
