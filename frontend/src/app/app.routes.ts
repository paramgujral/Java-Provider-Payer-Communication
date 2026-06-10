import { Routes } from '@angular/router';
import { ProviderComponent } from './components/provider/provider.component';
import { PayerComponent } from './components/payer/payer.component';
import { TrackingComponent } from './components/tracking/tracking.component';

export const routes: Routes = [
  { path: '', redirectTo: 'provider', pathMatch: 'full' },
  { path: 'provider', component: ProviderComponent },
  { path: 'payer', component: PayerComponent },
  { path: 'tracking', component: TrackingComponent },
  { path: '**', redirectTo: 'provider' }
];
