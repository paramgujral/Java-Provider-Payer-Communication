import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthorizationService, AuthorizationRequest, Page } from '../../../services/authorization.service';
import { AnalyticsService, ProviderAnalytics } from '../../../services/analytics.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class ProviderDashboardComponent implements OnInit {
  requests: AuthorizationRequest[] = [];
  analytics: ProviderAnalytics | null = null;
  loading = true;
  currentPage = 0;
  totalPages = 0;
  providerId = localStorage.getItem('userId') || 'PROV-101';

  // Chart configs
  public pieChartType: ChartType = 'pie';
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' }
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Approved', 'Rejected', 'Pending', 'Info Requested'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6']
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
    this.analyticsService.getProviderAnalytics(this.providerId).subscribe({
      next: (res) => {
        this.analytics = res;
        this.updateChartData();
      },
      error: (err) => console.error('Failed to load analytics', err)
    });
  }

  updateChartData() {
    if (!this.analytics) return;
    const stats = this.analytics.statusBreakdown;
    this.pieChartData = {
      labels: ['Approved', 'Rejected', 'Pending', 'Info Requested'],
      datasets: [{
        data: [
          stats['APPROVED'] || 0,
          stats['REJECTED'] || 0,
          stats['PENDING'] || 0,
          stats['INFO_REQUESTED'] || 0
        ],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6']
      }]
    };
  }

  loadRequests(page: number) {
    this.loading = true;
    this.authService.getRequestsByProvider(this.providerId, page, 10).subscribe({
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
