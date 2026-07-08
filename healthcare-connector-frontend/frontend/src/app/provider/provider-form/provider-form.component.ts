import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AuthorizationRequest, ValidationIssue } from '../../core/models/authorization-request.model';

@Component({
  selector: 'app-provider-form',
  templateUrl: './provider-form.component.html'
})
export class ProviderFormComponent {
  request: AuthorizationRequest = {
    patientName: '',
    patientDob: '',
    patientGender: '',
    diagnosisCode: '',
    diagnosisDescription: '',
    requestedProcedure: '',
    insuranceProvider: '',
    policyNumber: '',
    groupNumber: '',
    memberId: ''
  };

  validationIssues: ValidationIssue[] = [];
  validated = false;
  submitting = false;
  submitted = false;
  submitError = '';

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  // Step: run the AI Copilot (rule-based today) validation before allowing submission
  onValidate(): void {
    this.validated = false;
    this.api.validateRequest(this.request).subscribe({
      next: result => {
        this.validationIssues = result.issues;
        this.validated = result.valid;
      },
      error: () => {
        this.validationIssues = [{ field: 'general', message: 'Could not reach the validation service. Try again.' }];
      }
    });
  }

  // Step: submit only after validation has passed
  onSubmit(): void {
    if (!this.validated) {
      return;
    }
    this.submitting = true;
    this.submitError = '';
    this.api.submitRequest(this.request).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted = true;
      },
      error: () => {
        this.submitting = false;
        this.submitError = 'Submission failed. Please try again.';
      }
    });
  }

  onFieldChange(): void {
    // Any edit after validation invalidates the previous validation pass
    this.validated = false;
    this.validationIssues = [];
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
