import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

@Component({
  selector: 'app-home-redirect',
  standalone: true,
  template: ''
})
export class HomeRedirectComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);

  ngOnInit(): void {
    const role = (this.auth.getRole() || '').toUpperCase();

    if (role === 'PAYER') {
      this.router.navigate(['/payer']);
    } else if (role === 'ADMIN') {
      this.router.navigate(['/dashboard']);
    } else if (role === 'PROVIDER') {
      this.router.navigate(['/provider']);
    } else {
      this.router.navigate(['/provider']);
    }
  }
}
