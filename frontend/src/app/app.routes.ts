import { Routes } from '@angular/router';

import { Login } from './auth/login/login';
import { Register } from './auth/register/register';

import { Dashboard } from './provider/dashboard/dashboard';
import { Dashboard as PayerDashboard } from './payer/dashboard/dashboard';
import { Dashboard as AdminDashboard } from './admin/dashboard/dashboard';
import { UploadComponent } from './authorization/upload/upload';

import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'register',
    component: Register
  },

  {
    path: 'provider/dashboard',
    component: Dashboard,
    canActivate: [authGuard, roleGuard],
    data: {
      role: 'PROVIDER'
    }
  },

  {
    path: 'payer/dashboard',
    component: PayerDashboard,
    canActivate: [authGuard, roleGuard],
    data: {
      role: 'PAYER'
    }
  },

  {
    path: 'admin/dashboard',
    component: AdminDashboard,
    canActivate: [authGuard, roleGuard],
    data: {
      role: 'ADMIN'
    }
  },

  {
    path: 'authorization/upload',
    component: UploadComponent,
    canActivate: [authGuard, roleGuard],
    data: {
      role: 'PROVIDER'
    }
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];