import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  type: string;
  requestId: number;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationApiService {

  private http       = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl     = 'http://localhost:8080/api/notifications';

  private getHeaders(): HttpHeaders {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('token') : null;
    return new HttpHeaders({
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // GET all notifications for logged-in user
  getMyNotifications(): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(
      this.apiUrl, { headers: this.getHeaders() }
    );
  }

  // GET unread count
  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.apiUrl}/unread-count`, { headers: this.getHeaders() }
    );
  }

  // PUT mark all read
  markAllRead(): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/mark-all-read`, {}, { headers: this.getHeaders() }
    );
  }
}
