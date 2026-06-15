import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClaimService, ClaimDTO } from '../../services/claim.service';
import { PatientService, PatientDTO } from '../../services/patient.service';
import { PolicyService } from '../../services/policy.service';
import { DiseaseService, DiseaseDTO } from '../../services/disease.service';
import { DocumentService } from '../../services/document.service';
import { InsuranceReviewService } from '../../services/insurance-review.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-claim-view',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, MatCardModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule,
    MatIconModule, MatDialogModule
  ],
  template: `
    <section class="page">
      <div class="header">
        <h2>Claim Details</h2>
        <a mat-button routerLink="/claims">Back to Claims</a>
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <div *ngIf="!loading && claim" class="detail-layout">
        <mat-card class="detail-card">
          <mat-card-header>
            <mat-card-title>Claim #{{ claim.claimNumber || claim.id.substring(0, 8) }}</mat-card-title>
            <mat-card-subtitle>
              Status: <span class="status-badge" [class]="statusClass(claim.status)">{{ claim.status }}</span>
            </mat-card-subtitle>
          </mat-card-header>
        </mat-card>

        <div class="info-grid">
          <mat-card class="info-card">
            <mat-card-title>Patient Information</mat-card-title>
            <mat-card-content>
              <p><strong>Name:</strong> {{ patientName }}</p>
              <p><strong>Patient Code:</strong> {{ patient?.patientCode || '-' }}</p>
              <p><strong>Age:</strong> {{ patient?.age ?? '-' }}</p>
              <p><strong>Gender:</strong> {{ patient?.gender || '-' }}</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="info-card">
            <mat-card-title>Policy Information</mat-card-title>
            <mat-card-content>
              <p><strong>Policy #:</strong> {{ policy?.policyNumber || '-' }}</p>
              <p><strong>Company:</strong> {{ companyName }}</p>
              <p><strong>Coverage:</strong> {{ policy?.coverageAmount | currency }}</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="info-card">
            <mat-card-title>Disease / Diagnosis</mat-card-title>
            <mat-card-content>
              <p><strong>Code:</strong> {{ disease?.diseaseCode || '-' }}</p>
              <p><strong>Name:</strong> {{ disease?.diseaseName || '-' }}</p>
              <p><strong>Description:</strong> {{ disease?.description || '-' }}</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="info-card">
            <mat-card-title>Claim Financials</mat-card-title>
            <mat-card-content>
              <p><strong>Amount:</strong> {{ claim.amount | currency }}</p>
              <p><strong>Requested:</strong> {{ claim.requestedAmount || claim.amount | currency }}</p>
              <p><strong>Approved:</strong> {{ claim.approvedAmount ? (claim.approvedAmount | currency) : '-' }}</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="info-card full-width">
            <mat-card-title>Remarks</mat-card-title>
            <mat-card-content>
              <p><strong>Healthcare:</strong> {{ claim.healthcareRemarks || 'None' }}</p>
              <p><strong>Insurance:</strong> {{ claim.insuranceRemarks || 'None' }}</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="info-card full-width" *ngIf="documents?.length">
            <mat-card-title>Documents</mat-card-title>
            <mat-card-content>
              <ul class="doc-list">
                <li *ngFor="let doc of documents">
                  <a [href]="doc.filePath" target="_blank" class="doc-link">{{ doc.fileName }}</a>
                  <span class="doc-type">{{ doc.documentType }}</span>
                </li>
              </ul>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card class="timeline-card">
          <mat-card-title>Claim Timeline</mat-card-title>
          <mat-card-content>
            <div class="timeline">
              <div class="timeline-item" *ngFor="let event of timeline">
                <div class="timeline-dot" [class]="event.type"></div>
                <div class="timeline-content">
                  <strong>{{ event.label }}</strong>
                  <span class="timeline-date">{{ event.date | date: 'medium' }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="approval-actions" *ngIf="canAct">
          <button mat-raised-button color="warn" (click)="reject()">
            <mat-icon>close</mat-icon> Reject
          </button>
          <button mat-raised-button color="primary" (click)="openApproveDialog()">
            <mat-icon>check</mat-icon> Approve
          </button>
        </div>
      </div>

      <div *ngIf="!loading && !claim" class="muted">
        <p>Claim not found.</p>
        <a mat-button routerLink="/claims">Back to Claims</a>
      </div>
    </section>
  `,
  styles: [`
    .page { padding: 16px; max-width: 1000px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }
    .detail-layout { display: flex; flex-direction: column; gap: 16px; }
    .detail-card { background: #fff; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
    .info-card { background: #fff; }
    .info-card.full-width { grid-column: 1 / -1; }
    .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
    .status-badge.DRAFT { background: #e0e0e0; color: #333; }
    .status-badge.SUBMITTED, .status-badge.UNDER_REVIEW { background: #fff3e0; color: #e65100; }
    .status-badge.PENDING { background: #e3f2fd; color: #1565c0; }
    .status-badge.APPROVED { background: #e8f5e9; color: #2e7d32; }
    .status-badge.REJECTED { background: #ffebee; color: #c62828; }
    .muted { color: #666; text-align: center; padding: 40px; }
    .doc-list { list-style: none; padding: 0; margin: 0; }
    .doc-list li { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eee; }
    .doc-link { color: #1a73e8; text-decoration: none; }
    .doc-type { color: #666; font-size: 0.85rem; }
    .timeline-card { background: #fff; }
    .timeline { display: flex; flex-direction: column; gap: 12px; }
    .timeline-item { display: flex; align-items: center; gap: 12px; }
    .timeline-dot { width: 12px; height: 12px; border-radius: 50%; background: #999; flex-shrink: 0; }
    .timeline-dot.created { background: #2196f3; }
    .timeline-dot.submitted { background: #ff9800; }
    .timeline-dot.reviewed { background: #4caf50; }
    .timeline-dot.rejected { background: #f44336; }
    .timeline-content { display: flex; flex-direction: column; }
    .timeline-date { color: #666; font-size: 0.85rem; }
    .approval-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 10px; }
  `]
})
export class ClaimViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private claimService = inject(ClaimService);
  private patientService = inject(PatientService);
  private policyService = inject(PolicyService);
  private diseaseService = inject(DiseaseService);
  private docService = inject(DocumentService);
  private reviewService = inject(InsuranceReviewService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  loading = true;
  claim: ClaimDTO | null = null;
  patient: PatientDTO | null = null;
  policy: any = null;
  disease: DiseaseDTO | null = null;
  companyName = '';
  patientName = '';
  documents: any[] = [];
  timeline: { label: string; date: Date; type: string }[] = [];
  canAct = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading = false; return; }
    this.loadClaim(id);
  }

  private loadClaim(id: string): void {
    this.loading = true;
    this.claimService.getById(id).subscribe({
      next: (c) => { this.claim = c; this.loadRelatedData(c); this.loading = false; },
      error: (err) => { console.error('Failed to load claim', err); this.notification.error('Failed to load claim.'); this.loading = false; }
    });
  }

  private loadRelatedData(claim: ClaimDTO): void {
    this.patientService.get(claim.patientId).subscribe({ next: (p) => { this.patient = p; this.patientName = `${p.firstName} ${p.lastName}`; }, error: () => {} });
    this.policyService.getById(claim.policyId).subscribe({ next: (pol) => { this.policy = pol; }, error: () => {} });
    this.diseaseService.get(claim.diseaseId).subscribe({ next: (d) => (this.disease = d), error: () => {} });
    this.docService.listByClaimId(claim.id).subscribe({ next: (docs) => (this.documents = docs), error: () => {} });
    this.buildTimeline(claim);
    this.canAct = ['UNDER_REVIEW', 'PENDING'].includes((claim.status || '').toUpperCase());
  }

  private buildTimeline(claim: ClaimDTO): void {
    const events: { label: string; date: Date; type: string }[] = [
      { label: 'Claim Created', date: new Date(claim.createdAt), type: 'created' }
    ];
    if (claim.submittedAt) events.push({ label: 'Submitted for Review', date: new Date(claim.submittedAt), type: 'submitted' });
    if (claim.reviewedAt) events.push({ label: 'Reviewed', date: new Date(claim.reviewedAt), type: 'reviewed' });
    if (claim.status === 'APPROVED') events.push({ label: 'Approved', date: new Date(claim.updatedAt), type: 'reviewed' });
    if (claim.status === 'REJECTED') events.push({ label: 'Rejected', date: new Date(claim.updatedAt), type: 'rejected' });
    this.timeline = events;
  }

  statusClass(status: string): string { return (status || 'DRAFT').toUpperCase(); }

  openApproveDialog(): void {
    const dialogRef = this.dialog.open(ApproveDialogComponent, { width: '400px', data: { amount: this.claim?.amount || 0, remarks: '' } });
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.claim) {
        this.reviewService.approve(this.claim.id, { approvedAmount: result.amount, insuranceRemarks: result.remarks || undefined }).subscribe({
          next: () => {
            this.notification.success('Claim approved successfully.');
            this.canAct = false;
            this.claim!.status = 'APPROVED';
            this.claim!.approvedAmount = result.amount;
            this.claim!.insuranceRemarks = result.remarks || this.claim!.insuranceRemarks;
            this.buildTimeline(this.claim!);
          },
          error: (err) => { console.error('Failed to approve claim', err); this.notification.error('Failed to approve claim.'); }
        });
      }
    });
  }

  reject(): void {
    const dialogRef = this.dialog.open(RejectDialogComponent, { width: '400px', data: { remarks: '' } });
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.claim) {
        this.reviewService.reject(this.claim.id, { insuranceRemarks: result.remarks || undefined }).subscribe({
          next: () => {
            this.notification.success('Claim rejected.');
            this.canAct = false;
            this.claim!.status = 'REJECTED';
            this.claim!.insuranceRemarks = result.remarks || this.claim!.insuranceRemarks;
            this.buildTimeline(this.claim!);
          },
          error: (err) => { console.error('Failed to reject claim', err); this.notification.error('Failed to reject claim.'); }
        });
      }
    });
  }
}

@Component({
  selector: 'app-approve-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule],
  template: `
    <h3 mat-dialog-title>Approve Claim</h3>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Approved Amount</mat-label>
          <input matInput type="number" formControlName="amount" min="0" step="0.01" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Remarks</mat-label>
          <textarea matInput formControlName="remarks" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">Approve</button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; } mat-dialog-content { display: flex; flex-direction: column; gap: 16px; min-width: 350px; }`]
})
export class ApproveDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ApproveDialogComponent>);
  data = inject(MAT_DIALOG_DATA) as { amount: number; remarks: string };
  form = this.fb.nonNullable.group({ amount: [this.data.amount, [Validators.required, Validators.min(0)]], remarks: [this.data.remarks] });
  onCancel(): void { this.dialogRef.close(); }
  onConfirm(): void { if (this.form.invalid) return; this.dialogRef.close(this.form.value); }
}

@Component({
  selector: 'app-reject-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule],
  template: `
    <h3 mat-dialog-title>Reject Claim</h3>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Rejection Remarks</mat-label>
          <textarea matInput formControlName="remarks" rows="3" required></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">Reject</button>
    </mat-dialog-actions>
  `,
  styles: [`.full-width { width: 100%; } mat-dialog-content { display: flex; flex-direction: column; gap: 16px; min-width: 350px; }`]
})
export class RejectDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RejectDialogComponent>);
  data = inject(MAT_DIALOG_DATA) as { remarks: string };
  form = this.fb.nonNullable.group({ remarks: [this.data.remarks, Validators.required] });
  onCancel(): void { this.dialogRef.close(); }
  onConfirm(): void { if (this.form.invalid) return; this.dialogRef.close(this.form.value); }
}
