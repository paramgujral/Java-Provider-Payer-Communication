import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const providerGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isProvider()) return true;

  router.navigate([auth.isPayer() ? '/payer/dashboard' : '/auth/login']);
  return false;
};

export const payerGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isPayer()) return true;

  router.navigate([auth.isProvider() ? '/provider/dashboard' : '/auth/login']);
  return false;
};

export const loginGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true;

  // Already logged in — redirect to correct portal
  router.navigate([auth.isProvider() ? '/provider/dashboard' : '/payer/dashboard']);
  return false;
};
