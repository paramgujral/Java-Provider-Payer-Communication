import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[];
    const userRole = this.auth.getRole();

    if (!userRole) {
      this.router.navigate(['/login']);
      return false;
    }

    if (expectedRoles.includes(userRole)) {
      return true;
    }

    // Redirect to the correct dashboard based on role
    if (this.auth.isProvider()) {
      this.router.navigate(['/provider']);
    } else if (this.auth.isPayer()) {
      this.router.navigate(['/payer']);
    } else {
      this.router.navigate(['/login']);
    }
    return false;
  }
}