import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { ProviderDashboardComponent } from './features/provider/dashboard/provider-dashboard.component';
import { NewRequestComponent } from './features/provider/new-request/new-request.component';
import { RequestsListComponent } from './features/provider/requests-list/requests-list.component';
import { RequestDetailsComponent } from './features/provider/request-details/request-details.component';
import { PayerDashboardComponent } from './features/payer/dashboard/payer-dashboard.component';
import { PayerQueueComponent } from './features/payer/payer-queue/payer-queue.component';
import { PayerReviewComponent } from './features/payer/payer-review/payer-review.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  
  // Protected Provider routes
  { 
    path: 'provider/dashboard', 
    component: ProviderDashboardComponent,
    canActivate: [authGuard, roleGuard(['PROVIDER'])]
  },
  { 
    path: 'provider/requests/new', 
    component: NewRequestComponent,
    canActivate: [authGuard, roleGuard(['PROVIDER'])]
  },
  { 
    path: 'provider/requests', 
    component: RequestsListComponent,
    canActivate: [authGuard, roleGuard(['PROVIDER'])]
  },
  { 
    path: 'provider/requests/:id', 
    component: RequestDetailsComponent,
    canActivate: [authGuard, roleGuard(['PROVIDER'])]
  },
  
  // Protected Payer routes
  { 
    path: 'payer/dashboard', 
    component: PayerDashboardComponent,
    canActivate: [authGuard, roleGuard(['PAYER'])]
  },
  { 
    path: 'payer/requests', 
    component: PayerQueueComponent,
    canActivate: [authGuard, roleGuard(['PAYER'])]
  },
  { 
    path: 'payer/requests/:id', 
    component: PayerReviewComponent,
    canActivate: [authGuard, roleGuard(['PAYER'])]
  },

  // Fallbacks
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

