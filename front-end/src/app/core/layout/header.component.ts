import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';
import { NotificationBell } from '../websocket/notification.bell/notification.bell';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBell],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {

  private auth       = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  fullName = '';
  role     = '';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fullName = localStorage.getItem('fullName') || '';
      this.role     = localStorage.getItem('role') || '';
    }
  }

  logout(): void {
    this.auth.logout();
    window.location.href = '/login';
  }

  toggleSidebar(event: Event): void {
    try {
      document.body.classList.toggle('sidebar-open');
    } catch (e) {}
  }
}
