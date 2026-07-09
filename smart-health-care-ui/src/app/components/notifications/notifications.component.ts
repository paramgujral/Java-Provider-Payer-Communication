import { Component } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent {

  email: string = '';
  subject: string = '';
  message: string = '';

  claimId!: number;

  response: string = '';

  constructor(private notificationService: NotificationService) {}

  sendEmail() {
    this.notificationService
      .sendEmail(this.email, this.subject, this.message)
      .subscribe({
        next: (res: any) => {
          this.response = typeof res === 'string'
            ? res
            : 'Email request sent successfully.';
        },
        error: () => {
          this.response = 'Failed to send email.';
        }
      });
  }

  notifyStatus() {
    this.notificationService
      .notifyClaimStatus(this.claimId)
      .subscribe({
        next: (res: any) => {
          this.response = typeof res === 'string'
            ? res
            : 'Notification sent successfully.';
        },
        error: () => {
          this.response = 'Failed to notify claim status.';
        }
      });
  }

}