import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { TokenStorageService } from '../services/token-storage.service';

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const tokenService = inject(TokenStorageService);
  const user = tokenService.getUser();
  const expectedRole = route.data['role'];

  if (user?.role === expectedRole) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
