import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { ProviderDashboard } from './provider/provider-dashboard/provider-dashboard';
import { PayerDashboard } from './payer/payer-dashboard/payer-dashboard';


export const routes = [
  { path: '', component: Login },
{ path: 'provider-dashboard', component: ProviderDashboard },
{ path: 'payer-dashboard', component: PayerDashboard },
];


