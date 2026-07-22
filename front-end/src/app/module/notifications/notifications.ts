import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import {
  NotificationCenterService,
  NotificationDto
} from '../../core/websocket/notification.service';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsPageComponent implements OnInit, OnDestroy {
  notifications: NotificationDto[] = [];
  loading = false;
  markingId: number | null = null;
  errorMessage = '';
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private notificationCenterService: NotificationCenterService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.loadNotifications();
    this.pollInterval = setInterval(() => this.loadNotifications(true), 5000);
  }

  loadNotifications(silent = false): void {
    if (!silent) {
      this.loading = this.notifications.length === 0;
      this.errorMessage = '';
      this.cdr.markForCheck();
    }

    this.notificationCenterService.getMyNotifications(true).subscribe({
      next: (data) => {
        this.notifications = data || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        if (!silent) {
          this.errorMessage = 'Failed to load notifications.';
        }
        this.cdr.markForCheck();
      }
    });
  }

  markAllRead(): void {
    this.notifications = this.notifications.map((item) => ({ ...item, isRead: true }));
    this.cdr.markForCheck();
    this.notificationCenterService.markAllRead().subscribe({
      next: () => this.loadNotifications(true),
      error: () => {
        this.errorMessage = 'Failed to mark notifications as read.';
        this.loadNotifications(true);
        this.cdr.markForCheck();
      }
    });
  }

  markOneRead(item: NotificationDto): void {
    if (item.isRead || this.markingId === item.id) {
      return;
    }

    this.markingId = item.id;
    this.notifications = this.notifications.map((n) =>
      n.id === item.id ? { ...n, isRead: true } : n
    );
    this.cdr.markForCheck();

    this.notificationCenterService.markOneRead(item.id, item).subscribe({
      next: () => {
        this.markingId = null;
        this.loadNotifications(true);
        this.cdr.markForCheck();
      },
      error: () => {
        this.markingId = null;
        this.errorMessage = 'Failed to mark notification as read.';
        this.loadNotifications(true);
        this.cdr.markForCheck();
      }
    });
  }

  getStatusClass(isRead: boolean): string {
    return isRead ? 'status-read' : 'status-unread';
  }

  getStatusLabel(isRead: boolean): string {
    return isRead ? 'Read' : 'Unread';
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
