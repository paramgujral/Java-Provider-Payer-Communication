import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';

import { filter } from 'rxjs';
import { TokenStorageService } from '../../core/services/token-storage';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  showNav = true;
  role = '';

  constructor(
    private router: Router,
    private tokenStorage: TokenStorageService
  ) {
    this.showNav = !this.isAuthPage(this.router.url);
    this.role = this.tokenStorage.getUser()?.role || '';

    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      this.showNav = !this.isAuthPage(event.urlAfterRedirects);
      this.role = this.tokenStorage.getUser()?.role || '';
    });
  }

  isProvider(): boolean {
    return this.role === 'PROVIDER';
  }

  isPayer(): boolean {
    return this.role === 'PAYER';
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  private isAuthPage(url: string): boolean {
    return url.startsWith('/login') || url.startsWith('/register');
  }
}
