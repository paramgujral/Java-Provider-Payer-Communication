import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn) return true;
  router.navigate(['/login']);
  return false;
};

export const providerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isProvider || auth.isAdmin) return true;
  router.navigate(['/payer/dashboard']);
  return false;
};

export const payerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isPayer || auth.isAdmin) return true;
  router.navigate(['/provider/dashboard']);
  return false;
};
