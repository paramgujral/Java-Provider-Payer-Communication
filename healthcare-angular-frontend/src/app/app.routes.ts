import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';
import { DashboardComponent } from './pages/dashboard.component';
import { ProviderComponent } from './pages/provider.component';
import { PayerComponent } from './pages/payer.component';
import { AuthorizationComponent } from './pages/authorization.component';
import { AiReviewComponent } from './pages/ai-review.component';
import { NotificationComponent } from './pages/notification.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'providers', component: ProviderComponent, canActivate: [authGuard] },
  { path: 'payers', component: PayerComponent, canActivate: [authGuard] },
  { path: 'authorizations', component: AuthorizationComponent, canActivate: [authGuard] },
  { path: 'ai-review', component: AiReviewComponent, canActivate: [authGuard] },
  { path: 'notifications', component: NotificationComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
