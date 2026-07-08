const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'provider', component: ProviderRequestsComponent, canActivate: [authGuard], data: { roles: ['PROVIDER'] } },
  { path: 'payer', component: PayerRequestsComponent, canActivate: [authGuard], data: { roles: ['PAYER','ADMIN'] } },
  { path: 'notifications', component: NotificationComponent, canActivate: [authGuard], data: { roles: ['PROVIDER','PAYER','ADMIN','MANAGER'] } },
  { path: '**', redirectTo: 'dashboard' }
];
