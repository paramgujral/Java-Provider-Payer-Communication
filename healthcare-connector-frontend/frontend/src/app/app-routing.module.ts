import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { ProviderFormComponent } from './provider/provider-form/provider-form.component';
import { PayerDashboardComponent } from './payer/payer-dashboard/payer-dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'provider/form',
    component: ProviderFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'PROVIDER' }
  },
  {
    path: 'payer/dashboard',
    component: PayerDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'PAYER' }
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
