import { Routes } from '@angular/router';
import { authGuard, superAdminGuard, providerGuard, payerGuard } from './core/guards';
import { LoginComponent } from './features/auth/login/login.component';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard.component';
import { ProviderDashboardComponent } from './features/provider/dashboard/provider-dashboard.component';
import { PayerDashboardComponent } from './features/payer/dashboard/payer-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AdminDashboardComponent,
        canActivate: [superAdminGuard]
      },
      {
        path: '',
        component: ProviderDashboardComponent,
        canActivate: [providerGuard]
      },
      {
        path: '',
        component: PayerDashboardComponent,
        canActivate: [payerGuard]
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, superAdminGuard],
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      {
        path: 'providers',
        loadComponent: () => import('./features/admin/providers/providers.component').then(m => m.ProvidersComponent)
      },
      {
        path: 'payers',
        loadComponent: () => import('./features/admin/payers/payers.component').then(m => m.PayersComponent)
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./features/admin/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/admin/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent)
      }
    ]
  },
  {
    path: 'provider',
    canActivate: [authGuard, providerGuard],
    children: [
      {
        path: 'dashboard',
        component: ProviderDashboardComponent
      },
      {
        path: 'authorizations',
        loadComponent: () => import('./features/provider/authorizations/authorizations.component').then(m => m.AuthorizationsComponent)
      },
      {
        path: 'chat',
        loadComponent: () => import('./features/provider/chat/chat.component').then(m => m.ChatComponent)
      }
    ]
  },
  {
    path: 'payer',
    canActivate: [authGuard, payerGuard],
    children: [
      {
        path: 'dashboard',
        component: PayerDashboardComponent
      },
      {
        path: 'review',
        loadComponent: () => import('./features/payer/review/review.component').then(m => m.ReviewComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/payer/analytics/analytics.component').then(m => m.AnalyticsComponent)
      }
    ]
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/common/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/common/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
