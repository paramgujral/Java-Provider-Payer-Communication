import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUserValue;
    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    // Unauthorized, redirect based on current role if logged in
    if (user) {
      if (user.role === 'PROVIDER') {
        router.navigate(['/provider/dashboard']);
      } else if (user.role === 'PAYER') {
        router.navigate(['/payer/dashboard']);
      }
    } else {
      router.navigate(['/login']);
    }
    return false;
  };
};
