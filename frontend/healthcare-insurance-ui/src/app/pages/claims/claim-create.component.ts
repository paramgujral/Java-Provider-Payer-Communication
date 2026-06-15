import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClaimService, CreateClaimPayload } from '../../services/claim.service';
import { PatientService, PatientDTO } from '../../services/patient.service';
import { PolicyService } from '../../services/policy.service';
import { DiseaseService, DiseaseDTO } from '../../services/disease.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-claim-create',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule
  ],
  template: `
    <section class="page">
      <h2>Submit New Claim</h2>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form" *ngIf="!loading">
        <mat-form-field appearance="outline">
          <mat-label>Patient</mat-label>
          <mat-select formControlName="patientId" required>
            <mat-option *ngFor="let p of patients" [value]="p.id">
              {{ p.firstName }} {{ p.lastName }} ({{ p.patientCode }})
            </mat-option>
          </mat-select>
          <mat-error>Patient is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Insurance Policy</mat-label>
          <mat-select formControlName="policyId" required>
            <mat-option *ngFor="let pol of policies" [value]="pol.id">
              {{ pol.policyNumber }} - {{ pol.coverageAmount | currency }}
            </mat-option>
          </mat-select>
          <mat-error>Policy is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Disease / Diagnosis</mat-label>
          <mat-select formControlName="diseaseId" required>
            <mat-option *ngFor="let d of diseases" [value]="d.id">
              {{ d.diseaseCode }} - {{ d.diseaseName }}
            </mat-option>
          </mat-select>
          <mat-error>Disease is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Claim Amount</mat-label>
          <input matInput type="number" formControlName="amount" required min="0" step="0.01" />
          <mat-error>Please enter a valid amount</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Remarks</mat-label>
          <textarea matInput formControlName="remarks" rows="4"></textarea>
        </mat-form-field>

        <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>

        <div class="actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving">
            {{ saving ? 'Submitting...' : 'Submit Claim' }}
          </button>
          <a mat-button routerLink="/claims">Cancel</a>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .page { padding: 16px; }
    .form { max-width: 620px; display: flex; flex-direction: column; gap: 16px; margin-top: 14px; }
    .actions { display: flex; gap: 10px; margin-top: 10px; align-items: center; }
    .error { color: #b00020; font-weight: 600; margin-top: 8px; }
    .loading-container { display: flex; justify-content: center; padding: 40px; }
  `]
})
export class ClaimCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private claimService = inject(ClaimService);
  private patientService = inject(PatientService);
  private policyService = inject(PolicyService);
  private diseaseService = inject(DiseaseService);
  private notification = inject(NotificationService);

  loading = false;
  saving = false;
  errorMessage: string | null = null;
  patients: PatientDTO[] = [];
  policies: any[] = [];
  diseases: DiseaseDTO[] = [];

  form = this.fb.nonNullable.group({
    patientId: ['', Validators.required],
    policyId: ['', Validators.required],
    diseaseId: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0)]],
    remarks: ['']
  });

  ngOnInit(): void {
    this.loading = true;
    this.patientService.list().subscribe({ next: (d) => (this.patients = d), error: () => {} });
    this.policyService.listAll().subscribe({ next: (d) => (this.policies = d), error: () => {} });
    this.diseaseService.list().subscribe({
      next: (d) => (this.diseases = d),
      error: () => {},
      complete: () => (this.loading = false)
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    this.errorMessage = null;
    this.saving = true;

const payload: CreateClaimPayload = {
       patientId: this.form.value.patientId ?? '',
       policyId: this.form.value.policyId ?? '',
       diseaseId: this.form.value.diseaseId ?? '',
       amount: this.form.value.amount ?? 0,
       remarks: this.form.value.remarks || undefined
     };

    this.claimService.create(payload).subscribe({
      next: () => {
        this.saving = false;
        this.notification.success('Claim submitted successfully.');
        this.router.navigate(['/claims']);
      },
      error: (err) => {
        console.error('Failed to submit claim', err);
        this.errorMessage = 'Failed to submit claim.';
        this.saving = false;
      }
    });
  }
}
