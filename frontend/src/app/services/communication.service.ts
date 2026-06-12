import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ChatMessage } from '../models/models';
import { AuthService } from './auth.service';

declare const SockJS: any;
declare const Stomp: any;

@Injectable({ providedIn: 'root' })
export class CommunicationService {
  private readonly API = 'http://localhost:8080/api/communication';
  private stompClient: any;
  private messageSubject = new Subject<ChatMessage>();
  messages$ = this.messageSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  getMessages(caseId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.API}/${caseId}/messages`);
  }

  sendMessage(caseId: string, messageContent: string, messageType = 'CHAT'): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.API}/send`, { caseId, messageContent, messageType });
  }

  connectToCase(caseId: string): void {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = () => {};

    const headers: Record<string, string> = {};
    const token = this.authService.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    this.stompClient.connect(headers, () => {
      this.stompClient.subscribe(`/topic/case/${caseId}`, (message: any) => {
        const data: ChatMessage = JSON.parse(message.body);
        this.messageSubject.next(data);
      });
    });
  }

  disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.disconnect();
    }
  }
}
