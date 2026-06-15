import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClaimService, ClaimDTO } from '../../services/claim.service';
import { PatientService } from '../../services/patient.service';
import { PolicyService } from '../../services/policy.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-claim-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  template: `
    <section class="page">
      <div class="header">
        <h2>Claims</h2>
        <a mat-raised-button color="primary" routerLink="/claims/new">Submit Claim</a>
      </div>

      <div class="toolbar">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Status</mat-label>
          <mat-select [(value)]="statusFilter" (selectionChange)="applyFilter()">
            <mat-option value="">All</mat-option>
            <mat-option value="DRAFT">Draft</mat-option>
            <mat-option value="SUBMITTED">Submitted</mat-option>
            <mat-option value="UNDER_REVIEW">Under Review</mat-option>
            <mat-option value="APPROVED">Approved</mat-option>
            <mat-option value="REJECTED">Rejected</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search</mat-label>
          <input matInput (keyup)="applySearch($any($event.target).value)" placeholder="Patient name or claim #" />
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
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let row">
              <span class="status-badge" [class]="statusClass(row.status || '')">
                {{ row.status || 'DRAFT' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Submitted</th>
            <td mat-cell *matCellDef="let row">{{ row.submittedAt || 'Not submitted' | date: 'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" (click)="view(row.id)" title="View">
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
        <p class="muted">No claims found.</p>
      </ng-template>
    </section>
  `,
  styles: [`
    .page { padding: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .toolbar { display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
    .filter-field, .search-field { width: 250px; min-width: 180px; }
    .loading-container { display: flex; justify-content: center; padding: 40px; }
    .table-container { overflow-x: auto; }
    .w-full { width: 100%; }
    .muted { color: #666; text-align: center; padding: 30px; }
    .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
    .status-badge.DRAFT { background: #e0e0e0; color: #333; }
    .status-badge.SUBMITTED, .status-badge.UNDER_REVIEW { background: #fff3e0; color: #e65100; }
    .status-badge.APPROVED { background: #e8f5e9; color: #2e7d32; }
    .status-badge.REJECTED { background: #ffebee; color: #c62828; }
  `]
})
export class ClaimListComponent implements OnInit {
  private claimService = inject(ClaimService);
  private patientService = inject(PatientService);
  private policyService = inject(PolicyService);
  private notification = inject(NotificationService);

  displayedColumns: string[] = ['claimNumber', 'patient', 'amount', 'status', 'date', 'actions'];
  dataSource = new MatTableDataSource<ClaimDTO>([]);
  claims: ClaimDTO[] = [];
  patients: Map<string, string> = new Map();
  loading = false;
  statusFilter = '';
  private searchValue = '';

  ngOnInit(): void {
    this.loadClaims();
  }

  private loadClaims(): void {
    this.loading = true;
    this.claimService.listAll().subscribe({
      next: (data) => {
        this.claims = data;
        this.dataSource.data = data;
        this.loading = false;
        if (data.length > 0) this.loadPatientNames(data);
        this.applyFilter();
      },
      error: (err) => {
        console.error('Failed to load claims', err);
        this.notification.error('Failed to load claims.');
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

  statusClass(status: string): string {
    return status.toUpperCase();
  }

  applyFilter(): void {
    let filtered = [...this.claims];
    if (this.statusFilter) {
      filtered = filtered.filter(c => (c.status || 'DRAFT').toUpperCase() === this.statusFilter);
    }
    if (this.searchValue) {
      const q = this.searchValue.toLowerCase();
      filtered = filtered.filter(c =>
        (this.getPatientName(c.patientId).toLowerCase().includes(q)) ||
        ((c.claimNumber || '').toLowerCase().includes(q))
      );
    }
    this.dataSource.data = filtered;
  }

  applySearch(value: string): void {
    this.searchValue = value;
    this.applyFilter();
  }

  view(id: string): void {
    window.open(`/claims/${id}`, '_self');
  }
}
