import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { ProviderFormComponent } from './provider/provider-form/provider-form.component';
import { PayerDashboardComponent } from './payer/payer-dashboard/payer-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProviderFormComponent,
    PayerDashboardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
