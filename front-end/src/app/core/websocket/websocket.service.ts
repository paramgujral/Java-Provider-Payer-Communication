import { Injectable, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface WsNotification {
  title: string;
  message: string;
  type: string;
  requestId: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {

  private platformId  = inject(PLATFORM_ID);
  private stompClient: any = null;

  private notificationSubject = new BehaviorSubject<WsNotification | null>(null);
  notification$ = this.notificationSubject.asObservable();

  private unreadCount = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCount.asObservable();

  connect(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');

    if (!email || !token) {
      console.warn('WebSocket: no email/token found, skipping connect');
      return;
    }

    // Disconnect existing connection before reconnecting
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }

    Promise.all([
      import('sockjs-client'),
      import('@stomp/stompjs')
    ]).then(([SockJSModule, StompModule]) => {
      const SockJS = (SockJSModule as any).default || SockJSModule;
      const Client = StompModule.Client;

      this.stompClient = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

        // Pass JWT in connect headers so Spring can authenticate the WS connection
        connectHeaders: {
          Authorization: `Bearer ${token}`,
          login: email,
        },

        reconnectDelay: 5000,
        debug: (msg: string) => console.log('[STOMP]', msg),

        onConnect: () => {
          console.log('✅ WebSocket connected as:', email);

          // Spring uses /user/{principal}/queue/notifications
          // With SimpMessagingTemplate.convertAndSendToUser(email, "/queue/notifications", payload)
          // The client subscribes to /user/queue/notifications (Spring prepends /user/{email} automatically)
          this.stompClient.subscribe(
            '/user/queue/notifications',
            (message: any) => {
              try {
                const notification: WsNotification = JSON.parse(message.body);
                this.notificationSubject.next(notification);
                this.unreadCount.next(this.unreadCount.value + 1);
                console.log('🔔 New notification:', notification);
              } catch (e) {
                console.error('Failed to parse notification', e);
              }
            }
          );
        },

        onDisconnect: () => console.log('WebSocket disconnected'),
        onStompError: (frame: any) => console.error('STOMP error', frame),
      });

      this.stompClient.activate();
    }).catch(err => console.error('Failed to load WebSocket libs', err));
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  resetUnreadCount(): void {
    this.unreadCount.next(0);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
