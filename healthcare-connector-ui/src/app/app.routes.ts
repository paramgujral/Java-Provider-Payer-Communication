import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';

import { Dashboard } from './features/dashboard/dashboard';

import { authGuard } from './core/guards/auth-guard';

import { ProviderList } from './features/provider/provider-list/provider-list';

import { CreateProvider } from './features/provider/create-provider/create-provider';
import { PayerList } from './features/payer/payer-list/payer-list';
import { CreatePayer } from './features/payer/create-payer/create-payer';


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
  path: 'dashboard',
  component: Dashboard,
  canActivate: [authGuard]
},

{
    path: 'provider-list',
    component: ProviderList,
    canActivate: [authGuard]
},
{
    path: 'create-provider',
    component: CreateProvider,
    canActivate: [authGuard]
},

{
  path: 'payer-list',
  component: PayerList,
  canActivate: [authGuard]
},
{
  path: 'create-payer',
  component: CreatePayer,
  canActivate: [authGuard]
}

];