import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subscription, interval, startWith, switchMap } from 'rxjs';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  unreadCount: number = 0;
  notifications: Notification[] = [];
  private pollSub?: Subscription;
  private userSub?: Subscription;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.startPolling();
      } else {
        this.stopPolling();
      }
    });
  }

  private startPolling(): void {
    this.stopPolling();
    // Poll unread count and latest notifications every 30 seconds
    this.pollSub = interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.notificationService.getUnreadCount())
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.unreadCount = res.data;
          }
        },
        error: (err) => console.error('Failed to fetch unread count', err)
      });
  }

  private stopPolling(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
      this.pollSub = undefined;
    }
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (res) => {
        if (res.success) {
          this.notifications = res.data;
        }
      },
      error: (err) => console.error('Failed to load notifications list', err)
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: (res) => {
        if (res.success) {
          this.unreadCount = 0;
          this.loadNotifications();
        }
      }
    });
  }

  markAsRead(notif: Notification): void {
    if (notif.isRead) return;
    this.notificationService.markAsRead(notif.id).subscribe({
      next: (res) => {
        if (res.success) {
          notif.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      }
    });
  }

  getDashboardRoute(role: string): string {
    if (role === 'PROVIDER') {
      return '/provider/dashboard';
    } else if (role === 'PAYER') {
      return '/payer/dashboard';
    }
    return '/login';
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.stopPolling();
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
