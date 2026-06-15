import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { UserProfileModalComponent, UserProfileData } from '../shared/user-profile-modal/user-profile-modal.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, UserProfileModalComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  currentRole = localStorage.getItem('role') || 'provider';
  userId = localStorage.getItem('userId') || '';
  userName = localStorage.getItem('userName') || 'User';
  userEmail = localStorage.getItem('email') || '';
  isOrgAdmin = localStorage.getItem('orgAdmin') === 'true';

  unreadCount = 0;
  notifications: Notification[] = [];
  showNotifications = false;

  showProfileModal = false;
  showProfileDropdown = false;
  profileData: UserProfileData | null = null;
  
  pageTitle = 'Dashboard';

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.updateTitle(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTitle(event.urlAfterRedirects || event.url);
    });

    this.fetchNotifications();
    // Poll for notifications every 30 seconds
    setInterval(() => this.fetchNotifications(), 30000);
  }

  updateTitle(url: string) {
    if (url.includes('/dashboard')) this.pageTitle = 'Dashboard';
    else if (url.includes('/requests')) this.pageTitle = 'Requests Management';
    else if (url.includes('/network')) this.pageTitle = 'Network';
    else if (url.includes('/credentialing')) this.pageTitle = 'Credentialing';
    else if (url.includes('/users')) this.pageTitle = 'User Management';
    else this.pageTitle = 'HealthConnect';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown-wrapper')) {
      this.showProfileDropdown = false;
    }
    if (!target.closest('.notification-wrapper')) {
      this.showNotifications = false;
    }
  }

  fetchNotifications() {
    if (!this.userId) return;
    this.notificationService.getUnreadCount(this.userId).subscribe((res: any) => {
      this.unreadCount = res.unreadCount;
    });

    if (this.showNotifications) {
      this.notificationService.getNotifications(this.userId, 0, 5).subscribe((res: any) => {
        this.notifications = res.content;
      });
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showProfileDropdown = false;
    if (this.showNotifications && this.userId) {
      this.notificationService.getNotifications(this.userId, 0, 5).subscribe((res: any) => {
        this.notifications = res.content;
      });
    }
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
    this.showNotifications = false;
  }

  getAvatarInitials(): string {
    if (this.userName) {
      const parts = this.userName.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return this.userName.substring(0, 2).toUpperCase();
    }
    return this.currentRole === 'provider' ? 'PR' : 'PA';
  }

  markAsRead(notification: Notification, event: Event) {
    event.stopPropagation();
    if (notification.read) return;

    this.notificationService.markAsRead(notification.id).subscribe(() => {
      notification.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead(this.userId).subscribe(() => {
      this.notifications.forEach(n => n.read = true);
      this.unreadCount = 0;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openProfile() {
    this.profileData = {
      id: this.userId,
      name: this.userName,
      email: this.userEmail,
      role: this.currentRole,
      organizationId: localStorage.getItem('organizationId') || '',
      active: true,
      avatarInitials: this.currentRole === 'provider' ? 'PR' : 'PA'
    };
    this.showProfileModal = true;
  }
}
