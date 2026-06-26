import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthFormComponent } from './components/auth-form/auth-form.component';
import { StatusTrackingComponent } from './components/status-tracking/status-tracking.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'request/new', component: AuthFormComponent },
  { path: 'request/edit/:id', component: AuthFormComponent },
  { path: 'request/track/:id', component: StatusTrackingComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
