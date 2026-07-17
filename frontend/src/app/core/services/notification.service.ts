import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface NotificationPayload {
  event: string;
  recipient: string;
  message?: string;
}

export interface NotificationResponse {
  sent: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = environment.apiUrl + '/notifications';

  constructor(private http: HttpClient) {}

  send(payload: NotificationPayload): Observable<{ success: boolean; message: string; data: NotificationResponse }> {
    return this.http.post<{ success: boolean; message: string; data: NotificationResponse }>(this.api + '/send', payload);
  }
}