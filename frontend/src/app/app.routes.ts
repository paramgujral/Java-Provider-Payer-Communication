import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login-component/login-component';
import { RegisterComponent } from './pages/register-component/register-component';
import { ProviderDashboardComponent } from './pages/provider-dashboard-component/provider-dashboard-component';
import { PayerDashboardComponent } from './pages/payer-dashboard-component/payer-dashboard-component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'provider',
    component: ProviderDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['PROVIDER'] }
  },
  {
    path: 'payer',
    component: PayerDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['PAYER'] }
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
