import { Routes } from '@angular/router';
import { HealthcareDashboardComponent } from './pages/healthcare-dashboard/healthcare-dashboard.component';
import { InsuranceDashboardComponent } from './pages/insurance-dashboard/insurance-dashboard.component';
import { PatientListComponent } from './pages/patients/patient-list.component';
import { PatientFormComponent } from './pages/patients/patient-form.component';
import { PatientViewComponent } from './pages/patients/patient-view.component';
import { DiseaseListComponent } from './pages/diseases/disease-list.component';
import { DiseaseViewComponent } from './pages/diseases/disease-view.component';
import { PolicyListComponent } from './pages/policies/policy-list.component';
import { PolicyFormComponent } from './pages/policies/policy-form.component';
import { PolicyViewComponent } from './pages/policies/policy-view.component';
import { ClaimListComponent } from './pages/claims/claim-list.component';
import { ClaimCreateComponent } from './pages/claims/claim-create.component';
import { ClaimViewComponent } from './pages/claims/claim-view.component';
import { InsuranceIncomingClaimsComponent } from './pages/insurance/insurance-incoming-claims.component';
import { InsuranceReviewDetailComponent } from './pages/insurance/insurance-review-detail.component';
import { ApprovedClaimsComponent } from './pages/insurance/approved-claims.component';
import { RejectedClaimsComponent } from './pages/insurance/rejected-claims.component';

export const routes: Routes = [
  { path: '', redirectTo: 'healthcare/dashboard', pathMatch: 'full' },
  { path: 'dashboard', redirectTo: 'healthcare/dashboard', pathMatch: 'full' },
  { path: 'healthcare/dashboard', component: HealthcareDashboardComponent },
  { path: 'insurance/dashboard', component: InsuranceDashboardComponent },
  { path: 'patients', component: PatientListComponent },
  { path: 'patients/new', component: PatientFormComponent },
  { path: 'patients/:id', component: PatientViewComponent },
  { path: 'patients/:id/edit', component: PatientFormComponent },
  { path: 'diseases', component: DiseaseListComponent },
  { path: 'diseases/new', component: DiseaseViewComponent },
  { path: 'diseases/:id', component: DiseaseViewComponent },
  { path: 'diseases/:id/edit', component: DiseaseViewComponent },
  { path: 'policies', component: PolicyListComponent },
  { path: 'policies/new', component: PolicyFormComponent },
  { path: 'policies/:id', component: PolicyViewComponent },
  { path: 'claims', component: ClaimListComponent },
  { path: 'claims/new', component: ClaimCreateComponent },
  { path: 'claims/:id', component: ClaimViewComponent },
  { path: 'insurance/review', component: InsuranceIncomingClaimsComponent },
  { path: 'insurance/review/:id', component: InsuranceReviewDetailComponent },
  { path: 'insurance/approved', component: ApprovedClaimsComponent },
  { path: 'insurance/rejected', component: RejectedClaimsComponent },
  { path: '**', redirectTo: 'healthcare/dashboard' }
];
