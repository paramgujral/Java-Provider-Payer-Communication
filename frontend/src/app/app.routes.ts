import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { providerGuard, payerGuard, loginGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  {
    path: 'auth',
    canActivate: [loginGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // ── Provider portal ──────────────────────────────────────────────────────
  {
    path: 'provider',
    canActivate: [authGuard, providerGuard],
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout.component')
        .then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/provider/dashboard/provider-dashboard.component')
            .then(m => m.ProviderDashboardComponent)
      },
      {
        path: 'requests/new',
        loadComponent: () =>
          import('./features/provider/create-request/create-request.component')
            .then(m => m.CreateRequestComponent)
      },
      {
        path: 'requests/:id/resubmit',
        loadComponent: () =>
          import('./features/provider/resubmit/resubmit.component')
            .then(m => m.ResubmitComponent)
      },
      {
        path: 'requests/:id/audit',
        loadComponent: () =>
          import('./features/shared/audit-timeline/audit-timeline.component')
            .then(m => m.AuditTimelineComponent)
      },
      {
        path: 'requests/:id',
        loadComponent: () =>
          import('./features/shared/request-detail/request-detail.component')
            .then(m => m.RequestDetailComponent)
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./features/provider/view-requests/view-requests.component')
            .then(m => m.ViewRequestsComponent)
      },
      {
        path: 'kanban',
        loadComponent: () =>
          import('./features/shared/kanban-board/kanban-board.component')
            .then(m => m.KanbanBoardComponent)
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/shared/notifications/notifications.component')
            .then(m => m.NotificationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/shared/profile/profile.component')
            .then(m => m.ProfileComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ── Payer portal ─────────────────────────────────────────────────────────
  {
    path: 'payer',
    canActivate: [authGuard, payerGuard],
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout.component')
        .then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/payer/dashboard/payer-dashboard.component')
            .then(m => m.PayerDashboardComponent)
      },
      {
        path: 'queue/:id',
        loadComponent: () =>
          import('./features/payer/review-detail/review-detail.component')
            .then(m => m.ReviewDetailComponent)
      },
      {
        path: 'queue',
        loadComponent: () =>
          import('./features/payer/review-queue/review-queue.component')
            .then(m => m.ReviewQueueComponent)
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/payer/reports/payer-reports.component')
            .then(m => m.PayerReportsComponent)
      },
      {
        path: 'requests/:id/audit',
        loadComponent: () =>
          import('./features/shared/audit-timeline/audit-timeline.component')
            .then(m => m.AuditTimelineComponent)
      },
      {
        path: 'requests/:id',
        loadComponent: () =>
          import('./features/shared/request-detail/request-detail.component')
            .then(m => m.RequestDetailComponent)
      },
      {
        path: 'kanban',
        loadComponent: () =>
          import('./features/shared/kanban-board/kanban-board.component')
            .then(m => m.KanbanBoardComponent)
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/shared/notifications/notifications.component')
            .then(m => m.NotificationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/shared/profile/profile.component')
            .then(m => m.ProfileComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '/auth/login' }
];
