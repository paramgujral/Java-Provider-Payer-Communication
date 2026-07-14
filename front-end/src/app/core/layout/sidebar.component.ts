import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../features/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  /**
   * Returns normalized role.
   * Example:
   * ROLE_PROVIDER -> PROVIDER
   * ROLE_PAYER -> PAYER
   */
  get role(): string {
    const role = this.authService.getRole() || '';
    return role.replace('ROLE_', '').toUpperCase();
  }

  /**
   * User Full Name
   */
  get fullName(): string {
    return localStorage.getItem('fullName') || 'User';
  }

  /**
   * User Email
   */
  get email(): string {
    return localStorage.getItem('email') || '';
  }

  /**
   * Logout
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Close mobile sidebar
   */
  closeSidebar(): void {

    const body = document.body;
    body.classList.remove('sidebar-open');

    const sidebar = document.querySelector('.mobile-sidebar');
    sidebar?.classList.add('-translate-x-full');

    const overlay = document.querySelector('.overlay');
    overlay?.classList.add('hidden');
  }

}