import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage, SendMessageRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/api/chat`;

  constructor(private http: HttpClient) {}

  sendMessage(request: SendMessageRequest): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/send`, request);
  }

  getConversation(receiverId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/conversation/${receiverId}`);
  }

  getAllConversations(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/conversations`);
  }

  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/message/${messageId}`);
  }
}
