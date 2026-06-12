import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private auth = inject(AuthService);

  get role(): string | null {
    return this.auth.getRole();
  }

  closeSidebar() {
    try {
      const body = document.querySelector('body');
      if (body && body.classList.contains('sidebar-open')) body.classList.remove('sidebar-open');
    } catch (e) {
      // noop
    }
  }
}
