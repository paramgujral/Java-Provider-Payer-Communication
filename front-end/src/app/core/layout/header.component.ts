import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../features/auth/auth.service';
import { NotificationBell } from '../websocket/notification.bell/notification.bell';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationBell
  ],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  fullName: string = '';
  role: string = '';

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadUserDetails();
  }

  private loadUserDetails(): void {

    this.fullName =
      this.authService.getFullName?.() ??
      localStorage.getItem('fullName') ??
      'User';

    const storedRole =
      this.authService.getRole?.() ??
      localStorage.getItem('role') ??
      '';

    this.role = storedRole.replace('ROLE_', '').toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    document.body.classList.toggle('sidebar-open');
  }
}