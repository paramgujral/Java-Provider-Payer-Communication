import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../../features/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();
  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  const expectedRole = route.data?.['role'] as string | undefined;
  if (expectedRole) {
    const role = auth.getRole();
    if (!role || !role.toLowerCase().includes(expectedRole.toLowerCase())) {
      router.navigate(['/login']);
      return false;
    }
  }
  return true;
};
