import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription, timer } from 'rxjs';

import { WebSocketService } from '../websocket.service';
import { NotificationApiService } from '../notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.bell.html',
  styleUrl: './notification.bell.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationBell implements OnInit, AfterViewInit, OnDestroy {

  private wsService = inject(WebSocketService);
  private notificationService = inject(NotificationApiService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  notifications: Array<{
    title: string;
    message: string;
    type: string;
    createdAt: string;
    read: boolean;
  }> = [];

  unreadCount = 0;
  showPanel = false;

  private subscriptions: Subscription[] = [];
  private pollingSubscription?: Subscription;

  ngOnInit(): void {

    this.subscriptions.push(

      this.wsService.notification$.subscribe(notification => {

        if (!notification) {
          return;
        }

        const alreadyExists = this.notifications.some(n =>
          n.title === notification.title &&
          n.message === notification.message &&
          n.createdAt === notification.createdAt
        );

        if (!alreadyExists) {

          this.notifications.unshift({
            ...notification,
            read: false
          });

          this.unreadCount++;
          this.cdr.markForCheck();

        }

      })

    );

  }

  ngAfterViewInit(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadNotifications();

    this.wsService.connect();

    this.startPolling();

  }

  private startPolling(): void {

    this.pollingSubscription = timer(0, 4000).subscribe(() => {
      this.loadNotifications();
    });

  }

  private loadNotifications(): void {

    const token = localStorage.getItem('token');

    if (!token) {
      return;
    }

    this.notificationService.getMyNotifications().subscribe({

      next: (response) => {

        this.notifications = response.map(item => ({
          title: item.title,
          message: item.message,
          type: item.type,
          createdAt: item.createdAt,
          read: item.isRead
        }));

        this.unreadCount =
          this.notifications.filter(n => !n.read).length;

        this.cdr.markForCheck();

      },

      error: error => {
        console.error('Unable to load notifications', error);
      }

    });

  }

  togglePanel(): void {

    this.showPanel = !this.showPanel;
    this.cdr.markForCheck();

  }

  markAllRead(): void {

    this.notifications =
      this.notifications.map(notification => ({
        ...notification,
        read: true
      }));

    this.unreadCount = 0;

    this.notificationService.markAllRead().subscribe();

    this.wsService.resetUnreadCount();

    this.cdr.markForCheck();

  }

  ngOnDestroy(): void {

    this.subscriptions.forEach(subscription => subscription.unsubscribe());

    this.pollingSubscription?.unsubscribe();

  }

}