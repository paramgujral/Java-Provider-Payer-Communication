import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionAuthService } from '../../features/auth/auth.service';

@Component({
  selector: 'app-home-redirect',
  template: ''
})
export class HomeRedirectComponent implements OnInit {
  constructor(
    private router: Router,
    private sessionAuthService: SessionAuthService
  ) {}

  ngOnInit(): void {
    if (!this.sessionAuthService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const role = (this.sessionAuthService.getRole() || '').toUpperCase();

    if (role === 'PAYER') {
      this.router.navigate(['/payer']);
    } else if (role === 'ADMIN') {
      this.router.navigate(['/dashboard']);
    } else if (role === 'PROVIDER') {
      this.router.navigate(['/provider']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
