import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HighchartsChartModule } from 'highcharts-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app';
import { PortalHeaderComponent } from './core/layout/header.component';
import { HomeRedirectComponent } from './core/layout/home-redirect.component';
import { WorkspaceShellComponent } from './core/layout/shell.component';
import { PortalSidebarComponent } from './core/layout/sidebar.component';
import { NotificationBellComponent } from './core/websocket/notification.bell/notification.bell';
import { SignInPageComponent } from './features/auth/login.component';
import { RegisterPageComponent } from './features/auth/register.component';
import { UserManagementComponent } from './module/administration/user-creation/user-creation';
import { DashboardOverviewComponent } from './module/dashboard/dashboard';
import { PayerReviewComponent } from './module/payer/payer';
import { PayerProfileComponent } from './module/payer/payer-profile';
import { ProviderPortalComponent } from './module/provider/provider';
import { NotificationsPageComponent } from './module/notifications/notifications';
import { MaterialModule } from './shared/material.module';
import { JwtAuthInterceptor } from './core/auth/http.interceptor';
import { GlobalLoaderComponent } from './core/loader/global-loader.component';
import { GlobalLoaderInterceptor } from './core/loader/global-loader.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    SignInPageComponent,
    RegisterPageComponent,
    WorkspaceShellComponent,
    PortalHeaderComponent,
    PortalSidebarComponent,
    HomeRedirectComponent,
    NotificationBellComponent,
    DashboardOverviewComponent,
    ProviderPortalComponent,
    PayerReviewComponent,
    PayerProfileComponent,
    UserManagementComponent,
    NotificationsPageComponent,
    GlobalLoaderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    HighchartsChartModule,
    MaterialModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtAuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GlobalLoaderInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
