import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Page } from './authorization.service';

export interface Notification {
  id: string;
  recipientId: string;
  authorizationRequestId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(recipientId: string, page = 0, size = 10): Observable<Page<Notification>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Notification>>(`${this.apiUrl}/${recipientId}`, { params });
  }

  getUnreadNotifications(recipientId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/${recipientId}/unread`);
  }

  getUnreadCount(recipientId: string): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.apiUrl}/${recipientId}/unread/count`);
  }

  markAsRead(notificationId: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${notificationId}/read`, null);
  }

  markAllAsRead(recipientId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${recipientId}/read-all`, null);
  }
}
