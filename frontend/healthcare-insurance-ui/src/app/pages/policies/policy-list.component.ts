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
import { PolicyService, InsurancePolicyDTO } from '../../services/policy.service';
import { PatientService } from '../../services/patient.service';
import { InsuranceCompanyService } from '../../services/insurance-company.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule
  ],
  template: `
    <section class="page">
      <div class="header">
        <h2>Insurance Policies</h2>
        <a mat-raised-button color="primary" routerLink="/policies/new">Add Policy</a>
      </div>

      <div class="toolbar" *ngIf="!loading && policies.length">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Patient</mat-label>
          <input matInput (keyup)="applyFilter($any($event.target).value)" placeholder="Search patient" />
        </mat-form-field>
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="table-container" *ngIf="!loading; else noData">
        <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z1 w-full">
          <ng-container matColumnDef="policyNumber">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Policy Number</th>
            <td mat-cell *matCellDef="let row">{{ row.policyNumber }}</td>
          </ng-container>

          <ng-container matColumnDef="patient">
            <th mat-header-cell *matHeaderCellDef>Patient</th>
            <td mat-cell *matCellDef="let row">{{ getPatientName(row.patientId) }}</td>
          </ng-container>

          <ng-container matColumnDef="company">
            <th mat-header-cell *matHeaderCellDef>Insurance Company</th>
            <td mat-cell *matCellDef="let row">{{ getCompanyName(row.insuranceCompanyId) }}</td>
          </ng-container>

          <ng-container matColumnDef="coverage">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Coverage</th>
            <td mat-cell *matCellDef="let row">{{ row.coverageAmount | currency }}</td>
          </ng-container>

          <ng-container matColumnDef="dates">
            <th mat-header-cell *matHeaderCellDef>Dates</th>
            <td mat-cell *matCellDef="let row">
              {{ row.startDate || '-' }} to {{ row.endDate || '-' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button color="primary" (click)="view(row.id)" title="View">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button color="accent" (click)="edit(row.id)" title="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="delete(row)" title="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [pageSizeOptions]="[5, 10, 25]" [pageSize]="10" showFirstLastButtons></mat-paginator>
      </div>

      <ng-template #noData>
        <p class="muted">No policies found.</p>
      </ng-template>
    </section>
  `,
  styles: [`
    .page { padding: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .toolbar { display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
    .search-field { width: 300px; min-width: 200px; }
    .loading-container { display: flex; justify-content: center; padding: 40px; }
    .table-container { overflow-x: auto; }
    .w-full { width: 100%; }
    .muted { color: #666; text-align: center; padding: 30px; }
  `]
})
export class PolicyListComponent implements OnInit {
  private policyService = inject(PolicyService);
  private patientService = inject(PatientService);
  private companyService = inject(InsuranceCompanyService);
  private notification = inject(NotificationService);

  displayedColumns: string[] = ['policyNumber', 'patient', 'company', 'coverage', 'dates', 'actions'];
  dataSource = new MatTableDataSource<InsurancePolicyDTO>([]);
  policies: InsurancePolicyDTO[] = [];
  patients: Map<string, string> = new Map();
  companies: Map<string, string> = new Map();
  loading = false;

  ngOnInit(): void {
    this.loading = true;
    this.policyService.listAll().subscribe({
      next: (data) => {
        this.policies = data;
        this.dataSource.data = data;
        this.loading = false;
        if (data.length > 0) this.loadRefData(data);
      },
      error: (err) => {
        console.error('Failed to load policies', err);
        this.notification.error('Failed to load policies.');
        this.loading = false;
      }
    });
  }

  private loadRefData(policies: InsurancePolicyDTO[]): void {
    const patientIds = Array.from(new Set(policies.map(p => p.patientId)));
    const companyIds = Array.from(new Set(policies.map(p => p.insuranceCompanyId)));

    patientIds.forEach(id => {
      this.patientService.get(id).subscribe({
        next: (p) => this.patients.set(id, `${p.firstName} ${p.lastName}`),
        error: () => this.patients.set(id, 'Unknown')
      });
    });

    companyIds.forEach(id => {
      this.companyService.get(id).subscribe({
        next: (c) => this.companies.set(id, c.companyName),
        error: () => this.companies.set(id, 'Unknown')
      });
    });
  }

  getPatientName(id: string): string {
    return this.patients.get(id) || id;
  }

  getCompanyName(id: string): string {
    return this.companies.get(id) || id;
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  view(id: string): void {
    window.open(`/policies/${id}`, '_self');
  }

  edit(id: string): void {
    window.open(`/policies/${id}/edit`, '_self');
  }

  delete(row: InsurancePolicyDTO): void {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    if (!row.id) return;
    this.policyService.delete(row.id).subscribe({
      next: () => {
        this.notification.success('Policy deleted successfully.');
        this.policies = this.policies.filter(p => p.id !== row.id);
        this.dataSource.data = this.policies;
      },
      error: (err) => {
        console.error('Failed to delete policy', err);
        this.notification.error('Failed to delete policy.');
      }
    });
  }
}