import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { TokenStorageService } from '../services/token-storage.service';

export const authGuard: CanActivateFn = () => {
  const tokenService = inject(TokenStorageService);
  const router = inject(Router);

  if (tokenService.getToken()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
