import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SessionAuthGuard } from './core/auth/auth.guard';
import { HomeRedirectComponent } from './core/layout/home-redirect.component';
import { SignInPageComponent } from './features/auth/login.component';
import { RegisterPageComponent } from './features/auth/register.component';
import { WorkspaceShellComponent } from './core/layout/shell.component';
import { DashboardOverviewComponent } from './module/dashboard/dashboard';
import { PayerReviewComponent } from './module/payer/payer';
import { PayerProfileComponent } from './module/payer/payer-profile';
import { ProviderPortalComponent } from './module/provider/provider';
import { UserManagementComponent } from './module/administration/user-creation/user-creation';
import { NotificationsPageComponent } from './module/notifications/notifications';

const routes: Routes = [
  {
    path: 'login',
    component: SignInPageComponent
  },
  {
    path: 'register',
    component: RegisterPageComponent
  },
  {
    path: '',
    component: WorkspaceShellComponent,
    canActivate: [SessionAuthGuard],
    children: [
      {
        path: '',
        component: HomeRedirectComponent,
        pathMatch: 'full'
      },
      {
        path: 'provider',
        component: ProviderPortalComponent,
        canActivate: [SessionAuthGuard],
        data: { roles: ['ADMIN', 'PROVIDER'] }
      },
      {
        path: 'payer',
        component: PayerReviewComponent,
        canActivate: [SessionAuthGuard],
        data: { roles: ['ADMIN', 'PAYER'] }
      },
      {
        path: 'payer-profile',
        component: PayerProfileComponent,
        canActivate: [SessionAuthGuard],
        data: { roles: ['PAYER'] }
      },
      {
        path: 'dashboard',
        component: DashboardOverviewComponent,
        canActivate: [SessionAuthGuard],
        data: { roles: ['ADMIN', 'PROVIDER', 'PAYER', 'MANAGER'] }
      },
      {
        path: 'admin',
        component: UserManagementComponent,
        canActivate: [SessionAuthGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'notifications',
        component: NotificationsPageComponent,
        canActivate: [SessionAuthGuard],
        data: { roles: ['ADMIN', 'PROVIDER', 'PAYER', 'MANAGER'] }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
