import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRoles = route.data?.['roles'] as string[] | undefined;
  if (expectedRoles && expectedRoles.length > 0) {
    const role = auth.getRole();
    if (!role || !expectedRoles.map(r => r.toLowerCase()).includes(role.toLowerCase())) {
      router.navigate(['/forbidden']);
      return false;
    }
  }

  return true;
};
