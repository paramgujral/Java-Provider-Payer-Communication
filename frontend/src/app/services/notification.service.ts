import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AppNotification } from '../models/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly API = 'http://localhost:8080/api/notifications';
  private unreadCount$ = new BehaviorSubject<number>(0);
  unreadCount = this.unreadCount$.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.API);
  }

  refreshUnreadCount(): void {
    this.http.get<{ count: number }>(`${this.API}/unread-count`).subscribe(r => {
      this.unreadCount$.next(r.count);
    });
  }

  markAllRead(): Observable<any> {
    return this.http.post(`${this.API}/mark-all-read`, {}).pipe(
      tap(() => this.unreadCount$.next(0))
    );
  }

  markRead(id: number): Observable<any> {
    return this.http.post(`${this.API}/${id}/read`, {}).pipe(
      tap(() => this.refreshUnreadCount())
    );
  }
}
