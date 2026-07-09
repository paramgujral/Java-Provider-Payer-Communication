import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import{HttpClientModule} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClaimsComponent } from './components/claims/claims.component';
import { ClaimFormComponent } from './components/claim-form/claim-form.component';
import { ClaimAnalysisComponent } from './components/claim-analysis/claim-analysis.component';
import { FhirExportComponent } from './components/fhir-export/fhir-export.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ClaimsComponent,
    ClaimFormComponent,
    ClaimAnalysisComponent,
    FhirExportComponent,
    NotificationsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
