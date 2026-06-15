import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthorizationService, AuthorizationRequest, Page } from '../../../services/authorization.service';
import { AnalyticsService, PayerAnalytics } from '../../../services/analytics.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-payer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class PayerDashboardComponent implements OnInit {
  requests: AuthorizationRequest[] = [];
  analytics: PayerAnalytics | null = null;
  loading = true;
  currentPage = 0;
  totalPages = 0;
  payerId = localStorage.getItem('userId') || 'PAY-202';

  // Doughnut Chart (Workload)
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 20 } }
    }
  };
  public doughnutChartData: ChartData<'doughnut', number[], string | string[]> = {
    labels: ['Processed', 'Pending', 'Info Requested'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
      borderWidth: 0
    }]
  };

  // Bar Chart (Urgency)
  public barChartType: ChartType = 'bar';
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    }
  };
  public barChartData: ChartData<'bar', number[], string | string[]> = {
    labels: ['Emergency', 'Urgent', 'Routine'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#ef4444', '#f59e0b', '#94a3b8'],
      borderRadius: 4,
      barPercentage: 0.6
    }]
  };

  constructor(
    private authService: AuthorizationService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.loadAnalytics();
    this.loadRequests(0);
  }

  loadAnalytics() {
    this.analyticsService.getPayerAnalytics(this.payerId).subscribe({
      next: (res) => {
        this.analytics = res;
        this.updateChartData();
      },
      error: (err) => console.error('Failed to load analytics', err)
    });
  }

  refresh() {
    this.loadAnalytics();
    this.loadRequests(0);
  }

  updateChartData() {
    if (!this.analytics) return;
    const stats = this.analytics.statusBreakdown;
    this.doughnutChartData = {
      labels: ['Processed', 'Pending', 'Info Requested'],
      datasets: [{
        data: [
          (stats['APPROVED'] || 0) + (stats['REJECTED'] || 0),
          stats['PENDING'] || 0,
          stats['INFO_REQUESTED'] || 0
        ],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
        borderWidth: 0
      }]
    };

    const urgency = this.analytics.urgencyBreakdown;
    this.barChartData = {
      labels: ['Emergency', 'Urgent', 'Routine'],
      datasets: [{
        data: [
          urgency['Emergency'] || 0,
          urgency['Urgent'] || 0,
          urgency['Routine'] || 0
        ],
        backgroundColor: ['#ef4444', '#f59e0b', '#94a3b8'],
        borderRadius: 4,
        barPercentage: 0.6
      }]
    };
  }

  getInitials(providerId: string): string {
    if (!providerId) return 'PR';
    if (providerId === 'PROV-101') return 'GH'; // Mock Dr. Gregory House
    if (providerId.startsWith('PROV')) return providerId.substring(providerId.length - 2);
    return providerId.substring(0, 2).toUpperCase();
  }

  getAiScoreClass(score: number): string {
    if (score >= 0.8) return 'bg-green';
    return 'bg-orange';
  }

  loadRequests(page: number) {
    this.loading = true;
    this.authService.getRequestsByPayer(this.payerId, page, 10).subscribe({
      next: (response: Page<AuthorizationRequest>) => {
        this.requests = response.content;
        this.currentPage = response.number;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading requests', err);
        this.loading = false;
      }
    });
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'badge-pending';
      case 'APPROVED': return 'badge-approved';
      case 'REJECTED': return 'badge-rejected';
      case 'INFO_REQUESTED': return 'badge-info-requested';
      default: return 'badge-draft';
    }
  }
}
