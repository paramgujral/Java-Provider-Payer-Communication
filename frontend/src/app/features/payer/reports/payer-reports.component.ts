import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { Analytics } from '../../../core/models/analytics.models';

@Component({
  selector: 'app-payer-reports',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payer-reports.component.html',
  styleUrls: ['./payer-reports.component.scss']
})
export class PayerReportsComponent implements OnInit {
  analytics = signal<Analytics | null>(null);
  loading   = signal(true);
  error     = signal('');

  // Computed bar chart data
  statusBars = computed(() => {
    const a = this.analytics();
    if (!a) return [];
    const total = a.totalRequests || 1;
    return Object.entries(a.requestsByStatus)
      .sort((x, y) => y[1] - x[1])
      .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));
  });

  serviceBars = computed(() => {
    const a = this.analytics();
    if (!a) return [];
    const total = Object.values(a.requestsByServiceType).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(a.requestsByServiceType)
      .sort((x, y) => y[1] - x[1])
      .slice(0, 6)
      .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));
  });

  priorityBars = computed(() => {
    const a = this.analytics();
    if (!a) return [];
    const total = Object.values(a.requestsByPriority).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(a.requestsByPriority)
      .map(([label, count]) => ({ label, count, pct: Math.round((count / total) * 100) }));
  });

  aiDistribution = computed(() => {
    const a = this.analytics();
    if (!a) return [];
    const total = (a.highScoreCount + a.mediumScoreCount + a.lowScoreCount) || 1;
    return [
      { label: 'High (≥80%)',   count: a.highScoreCount,   pct: Math.round((a.highScoreCount / total) * 100),   cls: 'bar-green' },
      { label: 'Medium (40–79%)',count: a.mediumScoreCount, pct: Math.round((a.mediumScoreCount / total) * 100), cls: 'bar-yellow' },
      { label: 'Low (<40%)',    count: a.lowScoreCount,    pct: Math.round((a.lowScoreCount / total) * 100),    cls: 'bar-red' }
    ];
  });

  constructor(private analyticsSvc: AnalyticsService) {}

  ngOnInit(): void {
    this.analyticsSvc.getAnalytics().subscribe({
      next: data => { this.analytics.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('Failed to load analytics.'); this.loading.set(false); }
    });
  }

  statusBarColor(label: string): string {
    const m: Record<string, string> = {
      'Approved': 'bar-green', 'Denied': 'bar-red',
      'In Review': 'bar-yellow', 'Submitted': 'bar-blue',
      'Info Requested': 'bar-orange', 'Draft': 'bar-gray', 'Resubmitted': 'bar-cyan'
    };
    return m[label] ?? 'bar-gray';
  }

  providerApprovalRate(p: { submissionCount: number; approvedCount: number }): number {
    return p.submissionCount > 0 ? Math.round((p.approvedCount / p.submissionCount) * 100) : 0;
  }

  printReport(): void {
    window.print();
  }
}
