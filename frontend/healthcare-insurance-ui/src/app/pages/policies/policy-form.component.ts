import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PolicyService, InsurancePolicyDTO } from '../../services/policy.service';
import { PatientService, PatientDTO } from '../../services/patient.service';
import { InsuranceCompanyService, InsuranceCompanyDTO } from '../../services/insurance-company.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-policy-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <section class="page">
      <h2>{{ isEdit ? 'Edit Policy' : 'Create Policy' }}</h2>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form" *ngIf="!loading">
        <mat-form-field appearance="outline">
          <mat-label>Policy Number</mat-label>
          <input matInput formControlName="policyNumber" required />
          <mat-error>Policy number is required</mat-error>
        </mat-form-field>
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
          <mat-label>Insurance Company</mat-label>
          <mat-select formControlName="insuranceCompanyId" required>
            <mat-option *ngFor="let c of companies" [value]="c.id">
              {{ c.companyName }}
            </mat-option>
          </mat-select>
          <mat-error>Insurance company is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Coverage Amount</mat-label>
          <input matInput type="number" formControlName="coverageAmount" required min="0" step="0.01" />
          <mat-error>Please enter a valid coverage amount</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Start Date</mat-label>
          <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
          <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>End Date</mat-label>
          <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
          <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>

        <div class="error" *ngIf="errorMessage">{{ errorMessage }}</div>

        <div class="actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
          <a mat-button routerLink="/policies">Cancel</a>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .page { padding: 16px; }
    .form { max-width: 600px; display: flex; flex-direction: column; gap: 16px; margin-top: 14px; }
    .actions { display: flex; gap: 10px; margin-top: 10px; align-items: center; }
    .error { color: #b00020; font-weight: 600; margin-top: 8px; }
    .loading-container { display: flex; justify-content: center; padding: 40px; }
  `]
})
export class PolicyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private policyService = inject(PolicyService);
  private patientService = inject(PatientService);
  private companyService = inject(InsuranceCompanyService);
  private notification = inject(NotificationService);

  loading = false;
  saving = false;
  errorMessage: string | null = null;
  isEdit = false;
  private id: string | null = null;
  patients: PatientDTO[] = [];
  companies: InsuranceCompanyDTO[] = [];

  form = this.fb.nonNullable.group({
    policyNumber: ['', Validators.required],
    patientId: ['', Validators.required],
    insuranceCompanyId: ['', Validators.required],
    coverageAmount: [0, [Validators.required, Validators.min(0)]],
    startDate: [null as Date | null],
    endDate: [null as Date | null]
  });

  ngOnInit(): void {
    this.loading = true;
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;

    const patient$ = this.patientService.list();
    const company$ = this.companyService.list();

    patient$.subscribe({ next: (d) => (this.patients = d), error: () => {} });
    company$.subscribe({ next: (d) => (this.companies = d), error: () => {} });

    if (this.isEdit && this.id) {
      this.policyService.getById(this.id).subscribe({
        next: (policy) => {
          this.form.patchValue({
            policyNumber: policy.policyNumber,
            patientId: policy.patientId,
            insuranceCompanyId: policy.insuranceCompanyId,
            coverageAmount: policy.coverageAmount,
            startDate: policy.startDate ? new Date(policy.startDate) : null,
            endDate: policy.endDate ? new Date(policy.endDate) : null
          });
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load policy', err);
          this.errorMessage = 'Failed to load policy.';
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    this.errorMessage = null;
    this.saving = true;

    const payload: InsurancePolicyDTO = {
      id: this.isEdit && this.id ? this.id : undefined,
      policyNumber: this.form.value.policyNumber ?? '',
      patientId: this.form.value.patientId ?? '',
      insuranceCompanyId: this.form.value.insuranceCompanyId ?? '',
      coverageAmount: this.form.value.coverageAmount ?? 0,
      startDate: this.form.value.startDate ? this.form.value.startDate.toISOString().split('T')[0] : undefined,
      endDate: this.form.value.endDate ? this.form.value.endDate.toISOString().split('T')[0] : undefined
    };

    const req$ = this.isEdit && this.id
      ? this.policyService.update(this.id!, payload)
      : this.policyService.create(payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.notification.success(this.isEdit ? 'Policy updated successfully.' : 'Policy created successfully.');
        this.router.navigate(['/policies']);
      },
      error: (err) => {
        console.error('Failed to save policy', err);
        this.errorMessage = 'Failed to save policy.';
        this.saving = false;
      }
    });
  }
}
