import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../services/shared.service';
import { Notification, NotificationType } from '../../models';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private sharedService: SharedService) {}

  ngOnInit(): void {
    this.sharedService.getNotifications().subscribe((notifications) => {
      this.notifications = notifications;
    });
  }

  markAsRead(notificationId: string): void {
    this.sharedService.markNotificationAsRead(notificationId);
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
