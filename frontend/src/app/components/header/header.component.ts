import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { CurrentUser, Notification, NotificationType } from '../../models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class HeaderComponent implements OnInit {
  currentUser: CurrentUser | null = null;
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotificationsPanel = false;

  constructor(
    private sharedService: SharedService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sharedService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    this.sharedService.getNotifications().subscribe((notifications) => {
      this.notifications = notifications;
    });

    this.sharedService.unreadNotificationCount$.subscribe((count) => {
      this.unreadCount = count;
    });
  }

  toggleNotifications(): void {
    this.showNotificationsPanel = !this.showNotificationsPanel;
  }

  markNotificationAsRead(notificationId: string): void {
    this.sharedService.markNotificationAsRead(notificationId);
  }

  clearAllNotifications(): void {
    this.sharedService.clearAllNotifications();
    this.showNotificationsPanel = false;
  }

  logout(): void {
    this.sharedService.logout();
    this.router.navigate(['/login']);
  }

  getNotificationIcon(type: any): string {
    switch (type) {
      case NotificationType.NEW_REQUEST:
        return 'pi-inbox';
      case NotificationType.APPROVAL:
        return 'pi-check-circle';
      case NotificationType.REJECTION:
        return 'pi-times-circle';
      case NotificationType.NEW_MESSAGE:
        return 'pi-comments';
      default:
        return 'pi-bell';
    }
  }
}
