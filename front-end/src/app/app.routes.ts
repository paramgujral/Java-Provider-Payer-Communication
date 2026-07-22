import { Routes } from '@angular/router';
import { HomeRedirectComponent } from './core/layout/home-redirect.component';
import { WorkspaceShellComponent } from './core/layout/shell.component';
import { SignInPageComponent } from './features/auth/login.component';
import { UserManagementComponent } from './module/administration/user-creation/user-creation';
import { DashboardOverviewComponent } from './module/dashboard/dashboard';
import { PayerReviewComponent } from './module/payer/payer';
import { ProviderPortalComponent } from './module/provider/provider';

export const routes: Routes = [
  {
    path: 'login',
    component: SignInPageComponent
  },
  {
    path: '',
    component: WorkspaceShellComponent,
    children: [
      {
        path: '',
        component: HomeRedirectComponent,
        pathMatch: 'full'
      },
      {
        path: 'provider',
        component: ProviderPortalComponent
      },
      {
        path: 'payer',
        component: PayerReviewComponent
      },
      {
        path: 'dashboard',
        component: DashboardOverviewComponent
      },
      {
        path: 'admin',
        component: UserManagementComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
