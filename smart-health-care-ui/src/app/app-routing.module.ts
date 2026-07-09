import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClaimsComponent } from './components/claims/claims.component';
import { ClaimAnalysisComponent } from './components/claim-analysis/claim-analysis.component';
import { FhirExportComponent } from './components/fhir-export/fhir-export.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { ClaimFormComponent } from './components/claim-form/claim-form.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'claims', component: ClaimsComponent },
  { path: 'submit-claim', component: ClaimFormComponent },
  { path: 'analyze', component: ClaimAnalysisComponent },
  { path: 'fhir', component: FhirExportComponent },
  { path: 'notifications', component: NotificationsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }