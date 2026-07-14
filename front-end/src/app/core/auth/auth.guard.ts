import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRole = route.data?.['role'] as string | undefined;

  if (expectedRole) {
    const userRole = authService.getRole();

    if (!userRole || userRole.toUpperCase() !== expectedRole.toUpperCase()) {
      router.navigate(['/login']);
      return false;
    }
  }

  return true;
};