import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {

  if (typeof window === 'undefined') {
    return true;
  }

  const router = inject(Router);

  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};