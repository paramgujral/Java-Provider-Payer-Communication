import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChatMessage } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly API_URL = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  /**
   * Get messages for a specific request
   */
  getMessages(requestId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.API_URL}/${requestId}`);
  }

  /**
   * Send a new message
   */
  sendMessage(requestId: string, message: Partial<ChatMessage>): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.API_URL}/${requestId}`, message);
  }
}
