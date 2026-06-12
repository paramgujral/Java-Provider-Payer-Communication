import { UserCreation } from './module/administration/user-creation/user-creation';
import { Dashboard } from './module/dashboard/dashboard';
import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { ShellComponent } from './core/layout/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./core/layout/home-redirect.component').then(m => m.HomeRedirectComponent),
        pathMatch: 'full'
      },

      {
        path: 'provider',
        loadComponent: () =>
          import('./module/provider/provider')
            .then(m => m.Provider)
      },

      {
        path: 'payer',
        loadComponent: () =>
          import('./module/payer/payer')
            .then(m => m.Payer)
      },
         {
        path: 'dashboard',
        loadComponent: () =>
          import('./module/dashboard/dashboard')
            .then(m => m.Dashboard)
      },
        {
        path: 'admin',
        loadComponent: () =>
          import('./module/administration/user-creation/user-creation')
            .then(m => m.UserCreation)
      }




    ]
  },

  {
    path: '**',
    redirectTo: ''
  }
];
