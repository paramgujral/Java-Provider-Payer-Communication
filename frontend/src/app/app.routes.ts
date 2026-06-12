import { Routes } from '@angular/router';
import { authGuard, providerGuard, payerGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'provider/dashboard',
    loadComponent: () => import('./components/provider-dashboard/provider-dashboard.component').then(m => m.ProviderDashboardComponent),
    canActivate: [authGuard, providerGuard]
  },
  {
    path: 'provider/new-request',
    loadComponent: () => import('./components/new-request/new-request.component').then(m => m.NewRequestComponent),
    canActivate: [authGuard, providerGuard]
  },
  {
    path: 'payer/dashboard',
    loadComponent: () => import('./components/payer-dashboard/payer-dashboard.component').then(m => m.PayerDashboardComponent),
    canActivate: [authGuard, payerGuard]
  },
  {
    path: 'status',
    loadComponent: () => import('./components/status-tracking/status-tracking.component').then(m => m.StatusTrackingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'case/:caseId',
    loadComponent: () => import('./components/case-detail/case-detail.component').then(m => m.CaseDetailComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];
