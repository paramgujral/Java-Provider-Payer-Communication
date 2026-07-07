import {
  Component, inject, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef, PLATFORM_ID, AfterViewInit
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { WebSocketService, WsNotification } from '../websocket.service';
import { NotificationApiService } from '../notification.service';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.bell.html',
  styleUrl: './notification.bell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationBell implements OnInit, AfterViewInit, OnDestroy {

  private wsService  = inject(WebSocketService);
  private notifApi   = inject(NotificationApiService);
  private cdr        = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  notifications: Array<{
    title: string; message: string;
    type: string; createdAt: string; read: boolean;
  }> = [];

  unreadCount = 0;
  showPanel   = false;
  private subs: Subscription[] = [];
  private pollInterval: any = null;

  ngOnInit(): void {
    // Subscribe to real-time WebSocket stream
    this.subs.push(
      this.wsService.notification$.subscribe(n => {
        if (n) {
          this.notifications.unshift({ ...n, read: false });
          this.unreadCount++;
          this.cdr.markForCheck();
        }
      })
    );
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      this.loadFromDb();
      this.wsService.connect();
      this.startPolling();   // ← start 15s polling
    }, 30);
  }

  // ── Poll every 15 seconds ──────────────────────────
  startPolling(): void {
    this.pollInterval = setInterval(() => {
      this.loadFromDb();
    }, 4000);  // 15,000ms = 15 seconds
  }

  loadFromDb(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.notifApi.getMyNotifications().subscribe({
      next: (data) => {
        // Only update if count changed — avoids flicker
        const newUnread = data.filter(n => !n.isRead).length;
        const newList = data.map(n => ({
          title:     n.title,
          message:   n.message,
          type:      n.type,
          createdAt: n.createdAt,
          read:      n.isRead,
        }));

        // Check if there are genuinely new notifications
        const hasNew = newList.length > this.notifications.length;

        this.notifications = newList;
        this.unreadCount   = newUnread;

        if (hasNew) {
          console.log('🔔 New notifications found via polling');
        }

        this.cdr.markForCheck();
      },
      error: (err) => console.error('Poll failed:', err.status)
    });
  }

  togglePanel(): void {
    this.showPanel = !this.showPanel;
    this.cdr.markForCheck();
  }

  markAllRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.unreadCount   = 0;
    this.notifApi.markAllRead().subscribe();
    this.wsService.resetUnreadCount();
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    // ← Clear polling interval on destroy to prevent memory leaks
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
