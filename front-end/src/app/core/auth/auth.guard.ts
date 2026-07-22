import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';

import { SessionAuthService } from '../../features/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class SessionAuthGuard implements CanActivate {
  constructor(
    private sessionAuthService: SessionAuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
    const authToken = this.sessionAuthService.getToken();

    if (!authToken) {
      this.router.navigate(['/login']);
      return false;
    }

    const allowedRoles = this.getAllowedRoles(route);
    if (allowedRoles.length === 0) {
      return true;
    }

    const currentRole = (this.sessionAuthService.getRole() || '').toUpperCase();
    const isAllowed = allowedRoles.some((role) => currentRole === role.toUpperCase());

    if (!isAllowed) {
      this.router.navigate([this.homeRouteForRole(currentRole)]);
      return false;
    }

    return true;
  }

  private getAllowedRoles(route: ActivatedRouteSnapshot): string[] {
    const roles = route.data.roles as string[] | undefined;
    if (roles && roles.length) {
      return roles;
    }

    const singleRole = route.data.role as string | undefined;
    return singleRole ? [singleRole] : [];
  }

  private homeRouteForRole(role: string): string {
    if (role === 'PAYER') {
      return '/payer';
    }
    if (role === 'ADMIN' || role === 'MANAGER') {
      return '/dashboard';
    }
    if (role === 'PROVIDER') {
      return '/provider';
    }
    return '/login';
  }
}
