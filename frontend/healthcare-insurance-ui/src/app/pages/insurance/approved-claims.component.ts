import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClaimService, ClaimDTO } from '../../services/claim.service';
import { PatientService } from '../../services/patient.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-approved-claims',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule
  ],
  template: `
    <section class="page">
      <h2>Approved Claims</h2>

      <div class="toolbar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search Patient</mat-label>
          <input matInput (keyup)="applySearch($any($event.target).value)" placeholder="Patient name" />
        </mat-form-field>
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="table-container" *ngIf="!loading; else noData">
        <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z1 w-full">
          <ng-container matColumnDef="claimNumber">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Claim #</th>
            <td mat-cell *matCellDef="let row">{{ row.claimNumber || row.id.substring(0, 8) }}</td>
          </ng-container>

          <ng-container matColumnDef="patient">
            <th mat-header-cell *matHeaderCellDef>Patient</th>
            <td mat-cell *matCellDef="let row">{{ getPatientName(row.patientId) }}</td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
            <td mat-cell *matCellDef="let row">{{ row.amount | currency }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let row">
              <span class="status-badge approved">APPROVED</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="reviewed">
            <th mat-header-cell *matHeaderCellDef>Reviewed On</th>
            <td mat-cell *matCellDef="let row">{{ row.reviewedAt ? (row.reviewedAt | date: 'shortDate') : '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" [routerLink]="['/claims', row.id]" title="View Claim">
                <mat-icon>visibility</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 25]" [pageSize]="10" showFirstLastButtons></mat-paginator>
      </div>

      <ng-template #noData>
        <p class="muted">No approved claims found.</p>
      </ng-template>
    </section>
  `,
  styles: [`
    .page { padding: 16px; }
    .toolbar { display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
    .search-field { width: 300px; min-width: 200px; }
    .loading-container { display: flex; justify-content: center; padding: 40px; }
    .table-container { overflow-x: auto; }
    .w-full { width: 100%; }
    .muted { color: #666; text-align: center; padding: 30px; }
    .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
    .status-badge.approved { background: #e8f5e9; color: #2e7d32; }
  `]
})
export class ApprovedClaimsComponent implements OnInit {
  private claimService = inject(ClaimService);
  private patientService = inject(PatientService);
  private notification = inject(NotificationService);

  dataSource = new MatTableDataSource<ClaimDTO>([]);
  displayedColumns: string[] = ['claimNumber', 'patient', 'amount', 'status', 'reviewed', 'actions'];
  claims: ClaimDTO[] = [];
  patients: Map<string, string> = new Map();
  loading = false;
  private searchValue = '';

  ngOnInit(): void {
    this.loadApprovedClaims();
  }

  private loadApprovedClaims(): void {
    this.loading = true;
    this.claimService.listAll().subscribe({
      next: (data) => {
        const filtered = data.filter(c => (c.status || '').toUpperCase() === 'APPROVED');
        this.claims = filtered;
        this.dataSource.data = filtered;
        this.loading = false;
        if (filtered.length > 0) this.loadPatientNames(filtered);
        this.applySearch('');
      },
      error: (err) => {
        console.error('Failed to load approved claims', err);
        this.notification.error('Failed to load approved claims.');
        this.loading = false;
      }
    });
  }

  private loadPatientNames(claims: ClaimDTO[]): void {
    const patientIds = Array.from(new Set(claims.map(c => c.patientId)));
    patientIds.forEach(id => {
      this.patientService.get(id).subscribe({
        next: (p) => this.patients.set(id, `${p.firstName} ${p.lastName}`),
        error: () => this.patients.set(id, 'Unknown')
      });
    });
  }

  getPatientName(id: string): string {
    return this.patients.get(id) || id;
  }

  applySearch(value: string): void {
    this.searchValue = value;
    if (!value) {
      this.dataSource.data = this.claims;
      return;
    }
    const q = value.toLowerCase();
    this.dataSource.data = this.claims.filter(c => this.getPatientName(c.patientId).toLowerCase().includes(q));
  }
}
