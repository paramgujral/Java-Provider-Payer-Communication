import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SessionAuthService } from '../../features/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class PortalHeaderComponent implements OnInit {
  fullName = '';
  role = '';

  constructor(
    private sessionAuthService: SessionAuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fullName = localStorage.getItem('fullName') || '';
      this.role = localStorage.getItem('role') || '';
    }
  }

  logout(): void {
    this.sessionAuthService.clearSession();
    window.location.href = '/login';
  }

  toggleSidebar(): void {
    try {
      document.body.classList.toggle('sidebar-open');
    } catch (_error) {}
  }
}
