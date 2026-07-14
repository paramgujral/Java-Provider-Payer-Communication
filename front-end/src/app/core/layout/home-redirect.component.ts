import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

@Component({
  selector: 'app-home-redirect',
  standalone: true,
  template: ''
})
export class HomeRedirectComponent implements OnInit {

  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {

    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    let role = this.authService.getRole() || '';

    // Normalize Spring Security roles
    role = role.replace('ROLE_', '').toUpperCase();

    switch (role) {

      case 'PROVIDER':
        this.router.navigate(['/provider']);
        break;

      case 'PAYER':
        this.router.navigate(['/payer']);
        break;

      case 'ADMIN':
        this.router.navigate(['/dashboard']);
        break;

      case 'MANAGER':
        this.router.navigate(['/dashboard']);
        break;

      default:
        this.router.navigate(['/login']);
        break;
    }
  }
}