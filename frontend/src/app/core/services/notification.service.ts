import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, Notification } from '../models/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.apiUrl}/notifications`;

  unreadCount = signal(0);

  constructor(private http: HttpClient) {}

  getAll(): Observable<Notification[]> {
    return this.http.get<ApiResponse<Notification[]>>(this.base)
      .pipe(map(r => r.data));
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.base}/unread-count`)
      .pipe(
        map(r => r.data.count),
        tap(count => this.unreadCount.set(count))
      );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/${id}/read`, {})
      .pipe(
        map(() => void 0),
        tap(() => this.unreadCount.update(c => Math.max(0, c - 1)))
      );
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/read-all`, {})
      .pipe(
        map(() => void 0),
        tap(() => this.unreadCount.set(0))
      );
  }
}
