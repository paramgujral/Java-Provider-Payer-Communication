import { Component } from '@angular/core';
import { SessionAuthService } from '../../features/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class PortalSidebarComponent {
  constructor(private sessionAuthService: SessionAuthService) {}

  get role(): string | null {
    return this.sessionAuthService.getRole();
  }

  closeSidebar(): void {
    try {
      const body = document.querySelector('body');
      if (body && body.classList.contains('sidebar-open')) body.classList.remove('sidebar-open');
    } catch (_error) {
      // noop
    }
  }
}
