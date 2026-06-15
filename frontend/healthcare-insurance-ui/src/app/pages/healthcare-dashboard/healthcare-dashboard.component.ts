import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Chart, ChartConfiguration } from 'chart.js';
import { DashboardService, HealthcareStats } from '../../services/dashboard.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-healthcare-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatProgressSpinnerModule],
  template: `
    <section class="page">
      <h1>Healthcare Dashboard</h1>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <div *ngIf="!loading && stats" class="dashboard-content">
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-header>
              <mat-card-title>Total Patients</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ stats.totalPatients }}</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-header>
              <mat-card-title>Total Claims</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ stats.totalClaims }}</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card pending">
            <mat-card-header>
              <mat-card-title>Pending Claims</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ stats.pendingClaims }}</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card approved">
            <mat-card-header>
              <mat-card-title>Approved Claims</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ stats.approvedClaims }}</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card rejected">
            <mat-card-header>
              <mat-card-title>Rejected Claims</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-value">{{ stats.rejectedClaims }}</div>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Claims Overview</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-container">
              <canvas #claimsChart></canvas>
            </div>
          </mat-card-content>
        </mat-card>

        <div class="quick-links">
          <a mat-raised-button color="primary" routerLink="/patients">Manage Patients</a>
          <a mat-raised-button color="accent" routerLink="/claims">Manage Claims</a>
          <a mat-raised-button routerLink="/policies">View Policies</a>
          <a mat-raised-button routerLink="/diseases">View Diseases</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page { padding: 16px; }
    .loading-container { display: flex; justify-content: center; padding: 60px; }
    .dashboard-content { display: flex; flex-direction: column; gap: 20px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .stat-card { background: #fff; }
    .stat-value { font-size: 2.5rem; font-weight: 700; color: #111; margin-top: 8px; }
    .stat-card.pending .stat-value { color: #e65100; }
    .stat-card.approved .stat-value { color: #2e7d32; }
    .stat-card.rejected .stat-value { color: #c62828; }
    .chart-card { background: #fff; }
    .chart-container { max-width: 500px; margin: 0 auto; }
    .quick-links { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 20px; }
  `]
})
export class HealthcareDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private notification = inject(NotificationService);

  loading = false;
  stats: HealthcareStats | null = null;
  private claimsChart: Chart | null = null;

  ngOnInit(): void {
    this.loading = true;
    this.dashboardService.getHealthcareStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.renderChart();
      },
      error: (err) => {
        console.error('Failed to load healthcare stats', err);
        this.notification.error('Failed to load dashboard statistics.');
        this.loading = false;
      }
    });
  }

  private renderChart(): void {
    if (!this.stats) return;

    const ctx = document.createElement('canvas') as HTMLCanvasElement;
    const container = document.querySelector('.chart-container');
    if (!container) return;
    container.innerHTML = '';
    container.appendChild(ctx);

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: ['Total', 'Pending', 'Approved', 'Rejected'],
        datasets: [
          {
            label: 'Claims',
            data: [this.stats.totalClaims, this.stats.pendingClaims, this.stats.approvedClaims, this.stats.rejectedClaims],
            backgroundColor: ['#1976d2', '#ff9800', '#2e7d32', '#c62828']
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    };

    this.claimsChart = new Chart(ctx, config);
  }
}
