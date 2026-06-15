import { Routes } from '@angular/router';
import { DashboardLandingComponent } from './components/dashboard-landing/dashboard-landing.component';
import { LayoutComponent } from './components/layout/layout.component';
import { ProviderDashboardComponent } from './components/provider/dashboard/dashboard.component';
import { PayerDashboardComponent } from './components/payer/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: DashboardLandingComponent },
  { path: 'login', loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent) },
  { 
    path: 'reset-password', 
    loadComponent: () => import('./components/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) 
  },
  { 
    path: 'provider', 
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: ProviderDashboardComponent },
      { path: 'network', loadComponent: () => import('./components/provider/network/network.component').then(m => m.ProviderNetworkComponent) },
      { path: 'requests', loadComponent: () => import('./components/provider/requests/provider-requests.component').then(m => m.ProviderRequestsComponent) },
      { path: 'requests/new', loadComponent: () => import('./components/provider/create-request/create-request.component').then(m => m.CreateRequestComponent) },
      { path: 'requests/:id', loadComponent: () => import('./components/shared/request-details/request-details.component').then(m => m.RequestDetailsComponent) },
      { path: 'staff', loadComponent: () => import('./components/provider/staff-management/staff-management.component').then(m => m.StaffManagementComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { 
    path: 'payer', 
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: PayerDashboardComponent },
      { path: 'credentialing', loadComponent: () => import('./components/payer/credentialing/credentialing.component').then(m => m.PayerCredentialingComponent) },
      { path: 'requests', loadComponent: () => import('./components/payer/requests/payer-requests.component').then(m => m.PayerRequestsComponent) },
      { path: 'requests/:id', loadComponent: () => import('./components/shared/request-details/request-details.component').then(m => m.RequestDetailsComponent) },
      { path: 'staff', loadComponent: () => import('./components/provider/staff-management/staff-management.component').then(m => m.StaffManagementComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { 
    path: 'admin', 
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];

