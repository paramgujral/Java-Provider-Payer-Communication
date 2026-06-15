import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { RxStomp } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client';

export interface NetworkAffiliationDto {
  id?: string;
  providerId: string;
  payerId: string;
  providerName?: string;
  payerName?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  requestedAt?: string;
  updatedAt?: string;
}

export interface NetworkMessageDto {
  id?: string;
  affiliationId: string;
  senderId: string;
  senderRole: string;
  content: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private apiUrl = `${environment.apiUrl}/network`;
  private rxStomp: RxStomp;

  constructor(private http: HttpClient) {
    this.rxStomp = new RxStomp();
  }

  initWebSocket(token: string) {
    this.rxStomp.configure({
      // We use SockJS, which requires the webSocketFactory 
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (msg: string) => {
        console.log(new Date(), msg);
      }
    });
    this.rxStomp.activate();
  }

  watchChat(affiliationId: string): Observable<NetworkMessageDto> {
    return this.rxStomp.watch(`/topic/chat/${affiliationId}`).pipe(
      map(message => JSON.parse(message.body) as NetworkMessageDto)
    );
  }

  requestAffiliation(data: { providerId: string, payerId: string, notes?: string }): Observable<NetworkAffiliationDto> {
    return this.http.post<NetworkAffiliationDto>(`${this.apiUrl}/request`, data);
  }

  updateAffiliationStatus(id: string, status: string): Observable<NetworkAffiliationDto> {
    return this.http.put<NetworkAffiliationDto>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  getProviderAffiliations(providerId: string): Observable<NetworkAffiliationDto[]> {
    return this.http.get<NetworkAffiliationDto[]>(`${this.apiUrl}/provider/${providerId}`);
  }

  getPayerAffiliations(payerId: string): Observable<NetworkAffiliationDto[]> {
    return this.http.get<NetworkAffiliationDto[]>(`${this.apiUrl}/payer/${payerId}`);
  }

  getMessages(affiliationId: string): Observable<NetworkMessageDto[]> {
    return this.http.get<NetworkMessageDto[]>(`${this.apiUrl}/${affiliationId}/messages`);
  }

  sendMessage(affiliationId: string, senderId: string, senderRole: string, content: string): Observable<NetworkMessageDto> {
    const data = { senderId, senderRole, content };
    return this.http.post<NetworkMessageDto>(`${this.apiUrl}/${affiliationId}/messages`, data);
  }
}
