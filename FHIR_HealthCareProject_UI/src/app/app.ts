import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ApiService, NotificationResponse } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('FHIR Auth Connector');
  
  showNotifications = signal(false);
  notifications = signal<NotificationResponse['notifications']>([]);
  unreadCount = signal(0);
  
  private pollIntervalId: any = null;

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.startNotificationPolling();
  }

  ngOnDestroy() {
    this.stopNotificationPolling();
  }

  startNotificationPolling() {
    // Poll notifications every 5 seconds when logged in
    this.loadNotifications();
    this.pollIntervalId = setInterval(() => {
      if (this.auth.isLoggedIn()) {
        this.loadNotifications();
      }
    }, 5000);
  }

  stopNotificationPolling() {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
    }
  }

  loadNotifications() {
    const user = this.auth.currentUser();
    if (!user) return;

    this.api.getNotifications(user.id).subscribe({
      next: (res) => {
        this.notifications.set(res.notifications);
        this.unreadCount.set(res.unreadCount);
      }
    });
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
    if (this.showNotifications() && this.unreadCount() > 0) {
      this.markAllAsRead();
    }
  }

  markAllAsRead() {
    const user = this.auth.currentUser();
    if (!user) return;

    this.api.markAllNotificationsRead(user.id).subscribe({
      next: () => {
        this.unreadCount.set(0);
        // Refresh local list flags
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
      }
    });
  }

  onNotificationClick(n: any) {
    this.api.markNotificationRead(n.id).subscribe({
      next: () => {
        n.isRead = true;
        this.showNotifications.set(false);
        // Direct route based on ID parsed from text (e.g. "Request (ID: 123)")
        const match = n.message.match(/ID: (\d+)/);
        if (match && match[1]) {
          this.router.navigate([`/request/track/${match[1]}`]);
        } else {
          this.router.navigate(['/dashboard']);
        }
      }
    });
  }

  logout() {
    this.stopNotificationPolling();
    this.auth.logout();
    this.showNotifications.set(false);
    this.router.navigate(['/login']);
  }
}
