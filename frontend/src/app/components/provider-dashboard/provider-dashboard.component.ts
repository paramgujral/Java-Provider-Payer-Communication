import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthorizationService } from '../../services/authorization.service';
import { AuthService } from '../../services/auth.service';
import { ProviderDashboard } from '../../models/models';

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="dash-header">
        <div>
          <h2>Welcome, {{ authService.currentUser?.fullName }}</h2>
          <p class="sub">{{ authService.currentUser?.organization }} · NPI managed via FHIR R4</p>
        </div>
        <a routerLink="/provider/new-request" class="btn btn-primary">
          ➕ New Authorization Request
        </a>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div><span>Loading dashboard...</span>
      </div>

      <ng-container *ngIf="!loading && data">
        <!-- KPI Cards -->
        <div class="grid-4" style="margin-bottom:24px">
          <div class="kpi-card">
            <span class="kpi-icon">📋</span>
            <span class="kpi-label">Total Cases</span>
            <span class="kpi-value">{{ data.totalCases }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-icon">⏳</span>
            <span class="kpi-label">Pending Review</span>
            <span class="kpi-value" style="color:var(--accent-yellow)">{{ data.pendingReview }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-icon">❓</span>
            <span class="kpi-label">Info Requested</span>
            <span class="kpi-value" style="color:var(--accent-purple)">{{ data.infoRequested }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-icon">✅</span>
            <span class="kpi-label">Finalized</span>
            <span class="kpi-value" style="color:var(--accent-green)">{{ data.finalized }}</span>
          </div>
        </div>

        <!-- Risk Score Banner -->
        <div class="card" style="margin-bottom:24px">
          <div class="card-header">
            <h3>🤖 AI Risk Overview</h3>
            <span class="risk-badge" [class]="getRiskClass(data.avgRiskScore)">
              Avg Score: {{ data.avgRiskScore | number:'1.0-1' }}%
            </span>
          </div>
          <div class="risk-bar-wrap">
            <div class="risk-bar-track">
              <div class="risk-bar-fill" [style.width.%]="data.avgRiskScore"
                   [class]="getRiskClass(data.avgRiskScore)"></div>
            </div>
            <span class="risk-bar-label">{{ data.avgRiskScore | number:'1.0-1' }}% average risk across all cases</span>
          </div>
        </div>

        <!-- Recent Cases -->
        <div class="card">
          <div class="card-header">
            <h3>Recent Cases</h3>
            <a routerLink="/status" class="btn btn-secondary btn-sm">View Kanban</a>
          </div>
          <table class="data-table" *ngIf="data.recentCases.length > 0; else noCases">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Patient</th>
                <th>ICD-10</th>
                <th>CPT</th>
                <th>AI Risk</th>
                <th>Status</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of data.recentCases">
                <td><code style="color:var(--accent-blue);font-size:12px">{{ c['caseId'] }}</code></td>
                <td style="color:var(--text-primary);font-weight:500">{{ c['patientName'] }}</td>
                <td><code>{{ c['icd10Code'] }}</code></td>
                <td><code>{{ c['cptCode'] }}</code></td>
                <td>
                  <span class="risk-badge" [class]="c['aiRiskLevel']">
                    {{ c['aiRiskScore'] }}% {{ c['aiRiskLevel'] }}
                  </span>
                </td>
                <td><span class="status-badge" [class]="c['status']">{{ formatStatus(c['status']) }}</span></td>
                <td>{{ formatDate(c['updatedAt']) }}</td>
                <td>
                  <a [routerLink]="['/case', c['caseId']]" class="btn btn-ghost btn-sm">View →</a>
                </td>
              </tr>
            </tbody>
          </table>
          <ng-template #noCases>
            <div class="empty-state">
              <p>No cases yet. <a routerLink="/provider/new-request">Create your first request →</a></p>
            </div>
          </ng-template>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; }
    .dash-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px;
      h2 { margin: 0 0 4px; font-size: 20px; }
      .sub { margin: 0; color: var(--text-muted); font-size: 12px; }
    }
    .loading-state { display: flex; align-items: center; gap: 12px; padding: 40px; color: var(--text-muted); }
    .risk-bar-wrap { display: flex; flex-direction: column; gap: 8px; }
    .risk-bar-track { height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; }
    .risk-bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease;
      &.GREEN  { background: var(--risk-green); }
      &.YELLOW { background: var(--risk-yellow); }
      &.RED    { background: var(--risk-red); }
    }
    .risk-bar-label { font-size: 12px; color: var(--text-muted); }
    .empty-state { padding: 32px; text-align: center; color: var(--text-muted); font-size: 13px; }
  `]
})
export class ProviderDashboardComponent implements OnInit {
  data: ProviderDashboard | null = null;
  loading = true;

  constructor(
    public authService: AuthService,
    private authorizationService: AuthorizationService
  ) {}

  ngOnInit(): void {
    this.authorizationService.getProviderDashboard().subscribe({
      next: d => { this.data = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getRiskClass(score: number): string {
    if (score >= 70) return 'RED';
    if (score >= 35) return 'YELLOW';
    return 'GREEN';
  }

  formatStatus(status: string): string {
    return (status || '').replace('_', ' ');
  }

  formatDate(ts: string): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString();
  }
}
