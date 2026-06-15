import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolicyService, InsurancePolicyDTO } from '../../services/policy.service';
import { PatientService, PatientDTO } from '../../services/patient.service';
import { InsuranceCompanyService, InsuranceCompanyDTO } from '../../services/insurance-company.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-policy-view',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <section class="page">
      <h2>Policy Details</h2>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading && policy">
        <mat-card class="detail-card">
          <mat-card-header>
            <mat-card-title>Policy #{{ policy.policyNumber }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p><strong>Patient:</strong> {{ patientName }}</p>
            <p><strong>Insurance Company:</strong> {{ companyName }}</p>
            <p><strong>Coverage Amount:</strong> {{ policy.coverageAmount | currency }}</p>
            <p><strong>Start Date:</strong> {{ policy.startDate || '-' }}</p>
            <p><strong>End Date:</strong> {{ policy.endDate || '-' }}</p>
          </mat-card-content>
        </mat-card>

        <div class="actions">
          <button mat-raised-button color="accent" [routerLink]="['/policies', policy.id, 'edit']">Edit</button>
          <button mat-raised-button color="warn" (click)="deletePolicy()">Delete</button>
          <a mat-button routerLink="/policies">Back to List</a>
        </div>
      </div>

      <div *ngIf="!loading && !policy" class="muted">
        <p>Policy not found.</p>
        <a mat-button routerLink="/policies">Back to List</a>
      </div>
    </section>
  `,
  styles: [`
    .page { padding: 16px; }
    .loading-container { display: flex; justify-content: center; padding: 40px; }
    .detail-card { background: #fff; max-width: 600px; margin-bottom: 16px; }
    .muted { color: #666; text-align: center; padding: 40px; }
    .actions { display: flex; gap: 10px; }
  `]
})
export class PolicyViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private policyService = inject(PolicyService);
  private patientService = inject(PatientService);
  private companyService = inject(InsuranceCompanyService);
  private notification = inject(NotificationService);

  loading = false;
  policy: InsurancePolicyDTO | null = null;
  patientName = '';
  companyName = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading = false; return; }
    this.loadPolicy(id);
  }

  private loadPolicy(id: string): void {
    this.loading = true;
    this.policyService.getById(id).subscribe({
      next: (p) => {
        this.policy = p;
        this.patientService.get(p.patientId).subscribe({
          next: (patient) => { this.patientName = `${patient.firstName} ${patient.lastName}`; },
          error: () => { this.patientName = 'Unknown'; }
        });
        this.companyService.get(p.insuranceCompanyId).subscribe({
          next: (company) => { this.companyName = company.companyName; },
          error: () => { this.companyName = 'Unknown'; }
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load policy', err);
        this.notification.error('Failed to load policy.');
        this.loading = false;
      }
    });
  }

  deletePolicy(): void {
    if (!this.policy || !confirm('Are you sure you want to delete this policy?')) return;
    if (!this.policy.id) return;
    this.policyService.delete(this.policy.id).subscribe({
      next: () => {
        this.notification.success('Policy deleted successfully.');
        this.router.navigate(['/policies']);
      },
      error: (err) => {
        console.error('Failed to delete policy', err);
        this.notification.error('Failed to delete policy.');
      }
    });
  }
}
