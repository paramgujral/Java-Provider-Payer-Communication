@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = '/api/notifications';
  private stompClient: any;
  private notifications$ = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient) {}

  getMyNotifications() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUnreadCount() {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`);
  }

  markAllRead() {
    return this.http.put<void>(`${this.apiUrl}/mark-all-read`, {});
  }

  connectWebSocket() {
    this.stompClient = Stomp.over(new SockJS('/ws'));
    this.stompClient.connect(
      { Authorization: `Bearer ${localStorage.getItem('token')}` },
      () => {
        this.stompClient.subscribe('/user/queue/notifications', (msg: any) => {
          const payload = JSON.parse(msg.body);
          this.notifications$.next([payload, ...this.notifications$.value]);
        });
      }
    );
  }

  getLiveNotifications() {
    return this.notifications$.asObservable();
  }
}
