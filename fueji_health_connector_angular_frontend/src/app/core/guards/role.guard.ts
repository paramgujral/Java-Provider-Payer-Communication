import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn() && authService.hasRole(allowedRoles)) {
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
};

export const superAdminGuard: CanActivateFn = roleGuard(['SUPER_ADMIN']);
export const providerGuard: CanActivateFn = roleGuard(['PROVIDER']);
export const payerGuard: CanActivateFn = roleGuard(['PAYER']);
