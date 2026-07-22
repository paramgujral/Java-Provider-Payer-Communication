import { Routes } from '@angular/router';
import { ProviderComponent } from './provider/provider.component';
import { PayerComponent } from './payer/payer.component';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'provider',
    pathMatch: 'full'
  },

  {
    path: 'provider',
    component: ProviderComponent
  },

  {
    path: 'payer',
    component: PayerComponent
  }

];