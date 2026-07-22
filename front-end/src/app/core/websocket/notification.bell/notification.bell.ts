import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { WebSocketService, WsNotification } from '../websocket.service';
import { NotificationCenterService } from '../notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification.bell.html',
  styleUrls: ['./notification.bell.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationBellComponent implements OnInit, AfterViewInit, OnDestroy {
  unreadCount = 0;
  private subs: Subscription[] = [];
  private pollInterval: any = null;

  constructor(
    private webSocketService: WebSocketService,
    private notificationCenterService: NotificationCenterService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.webSocketService.notification$.subscribe((notification: WsNotification | null) => {
        if (notification) {
          this.unreadCount++;
          this.cdr.markForCheck();
        }
      })
    );
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      this.loadUnreadCount();
      this.webSocketService.connect();
      this.startPolling();
    }, 30);
  }

  startPolling(): void {
    this.pollInterval = setInterval(() => {
      this.loadUnreadCount();
    }, 4000);
  }

  loadUnreadCount(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.notificationCenterService.getMyNotifications(true).subscribe({
      next: (data) => {
        this.unreadCount = data.filter((n) => !n.isRead).length;
        this.cdr.markForCheck();
      },
      error: (error) => console.error('Notification polling failed:', error.status)
    });
  }

  openNotificationsPage(): void {
    this.router.navigate(['/notifications']);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
