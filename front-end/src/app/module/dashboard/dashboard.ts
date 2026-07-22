import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import * as Highcharts from 'highcharts';
import { DashboardAnalyticsService, DashboardStats, ProviderSummary, PayerSummary } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardOverviewComponent implements OnInit, OnDestroy {
  highcharts = Highcharts;
  stats: DashboardStats | null = null;
  loading    = true;
  role       = '';

  isPieEmpty = false;
  isBarEmpty = false;

  // ── Provider donut chart (animated pie) ───────────
  providerChartOptions: Highcharts.Options = {};
  providerNames: string[] = [];
  currentProviderIndex = 0;
  private providerTimer: any = null;

  // ── Payer column chart ────────────────────────────
  payerChartOptions: Highcharts.Options = {};

  constructor(
    private dashboardAnalyticsService: DashboardAnalyticsService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    Highcharts.setOptions({
      lang: { thousandsSep: ',' },
      chart: {
        backgroundColor: '#ffffff',
        style: { fontFamily: 'Inter, system-ui, sans-serif' }
      }
    });
  }

  pieChartOptions: Highcharts.Options = this.buildPie([]);
  barChartOptions: Highcharts.Options = this.buildBar([], [], [], []);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.role = localStorage.getItem('role') || '';
      this.loadDashboardStats();
    }
  }

  loadDashboardStats(): void {
    this.loading = true;
    this.dashboardAnalyticsService.getStats().subscribe({
      next: (data) => {
        this.stats   = data;
        this.loading = false;

        this.isPieEmpty = data.statusDistribution.every(s => s.count === 0);

        const months    = data.monthlyByPriority.map(m => m.month);
        const normal    = data.monthlyByPriority.map(m => m.normal);
        const urgent    = data.monthlyByPriority.map(m => m.urgent);
        const emergency = data.monthlyByPriority.map(m => m.emergency);
        this.isBarEmpty =
          normal.every(v => v === 0) && urgent.every(v => v === 0) && emergency.every(v => v === 0)
        ;

        this.pieChartOptions = this.buildPie(data.statusDistribution);
        this.barChartOptions = this.buildBar(months, normal, urgent, emergency);

        if (this.role === 'ADMIN') {
          this.buildProviderDonut(data.providerSummary);
          this.buildPayerColumn(data.payerSummary);
        }

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Dashboard load failed', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Provider animated donut ───────────────────────
  buildProviderDonut(providers: ProviderSummary[]): void {
    if (!providers.length) return;

    this.providerNames = providers.map(p => p.providerName);
    this.currentProviderIndex = 0;

    const getSubtitle = (p: ProviderSummary) =>
      `<span style="font-size:48px;color:#111827;font-weight:700">${p.totalSubmitted}</span>
       <br><span style="font-size:13px;color:#6b7280">Total by <b>${p.providerName}</b></span>`;

    const getSlices = (p: ProviderSummary) => [
      { name: 'Approved', y: p.approved,  color: '#10b981' },
      { name: 'Rejected', y: p.rejected,  color: '#ef4444' },
      { name: 'Pending',  y: p.pending,   color: '#f59e0b' },
    ];

    const first = providers[0];

 this.providerChartOptions = {
  chart: {
    type: 'pie',
    height: 380,
    backgroundColor: '#ffffff'
  },
  title: {
    text: 'Provider Request Breakdown'
  },
  plotOptions: {
    pie: {
      borderWidth: 0,
      size: '100%',
      innerSize: '75%',
      dataLabels: {
        enabled: true,
        distance: -30
      },
      showInLegend: true
    }
  },
  series: [{
    type: 'pie',
    name: first.providerName,
    colorByPoint: true,
    data: getSlices(first)
  } as Highcharts.SeriesPieOptions],
  credits: {
    enabled: false
  }
};

    // Cycle through providers every 2 seconds if more than one
    if (providers.length > 1) {
      clearInterval(this.providerTimer);
      this.providerTimer = setInterval(() => {
        this.currentProviderIndex = (this.currentProviderIndex + 1) % providers.length;
        const current = providers[this.currentProviderIndex];
        this.providerChartOptions = {
          ...this.providerChartOptions,
          subtitle: { ...this.providerChartOptions.subtitle, text: getSubtitle(current) },
          series: [{ type: 'pie', name: current.providerName, data: getSlices(current) }]
        };
        this.cdr.markForCheck();
      }, 2500);
    }
  }

  goToProvider(index: number): void {
    if (!this.stats) return;
    clearInterval(this.providerTimer);
    this.currentProviderIndex = index;
    this.buildProviderDonut(this.stats.providerSummary.slice(index));
    this.cdr.markForCheck();
  }

  // ── Payer approved/rejected column ───────────────
  buildPayerColumn(payers: PayerSummary[]): void {
    if (!payers.length) return;

    this.payerChartOptions = {
      chart: { type: 'column', height: 380, backgroundColor: '#ffffff' },
      title: {
        text: 'Payer Review Summary',
        align: 'left',
        style: { color: '#111827', fontSize: '15px', fontWeight: '600' }
      },
      xAxis: {
        categories: payers.map(p => p.payerName),
        lineColor: '#e5e7eb', tickColor: '#e5e7eb',
        labels: { style: { color: '#6b7280', fontSize: '12px' } }
      },
      yAxis: {
        min: 0,
        gridLineColor: '#f3f4f6',
        title: { text: 'Requests', style: { color: '#9ca3af', fontSize: '12px' } },
        labels: { style: { color: '#6b7280', fontSize: '12px' } }
      },
      tooltip: {
        backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: 8,
        shared: true, style: { color: '#111827', fontSize: '13px' }
      },
      credits: { enabled: false },
      legend: {
        align: 'center', verticalAlign: 'bottom',
        itemStyle: { color: '#374151', fontSize: '12px', fontWeight: '400' }
      },
      plotOptions: {
        column: {
          borderRadius: 6,
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            style: { fontSize: '11px', fontWeight: '600', color: '#374151', textOutline: 'none' }
          }
        }
      },
      series: [
        {
          type: 'column', name: 'Total Reviewed',
          data: payers.map(p => p.totalReviewed),
          color: '#93c5fd'
        },
        {
          type: 'column', name: 'Approved',
          data: payers.map(p => p.approved),
          color: '#10b981'
        },
        {
          type: 'column', name: 'Rejected',
          data: payers.map(p => p.rejected),
          color: '#ef4444'
        }
      ]
    };
  }

  ngOnDestroy(): void {
    clearInterval(this.providerTimer);
  }

  // ── Standard charts ───────────────────────────────
  private buildPie(data: { status: string; count: number }[]): Highcharts.Options {
    const colorMap: Record<string, string> = {
      'Approved': '#10b981', 'Pending': '#f59e0b',
      'Under Review': '#3b82f6', 'Rejected': '#ef4444',
    };
    return {
      chart: { type: 'pie', height: 380, backgroundColor: '#ffffff' },
      title: { text: 'Prior Authorization Status', align: 'left',
        style: { color: '#111827', fontSize: '15px', fontWeight: '600' } },
      tooltip: { backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: 8,
        style: { color: '#111827', fontSize: '13px' },
        pointFormat: '<b>{point.name}: {point.y}</b> ({point.percentage:.0f}%)' },
      credits: { enabled: false },
      legend: { enabled: true, align: 'center', verticalAlign: 'bottom',
        itemStyle: { color: '#374151', fontSize: '12px', fontWeight: '400' } },
      plotOptions: {
        pie: { innerSize: '65%', dataLabels: { enabled: false },
               showInLegend: true, borderWidth: 0 }
      },
      series: [{
        type: 'pie', name: 'Requests',
        data: data.length > 0
          ? data.map(s => ({ name: s.status, y: Number(s.count), color: colorMap[s.status] ?? '#6b7280' }))
          : [
              { name: 'Approved', y: 42, color: '#10b981' },
              { name: 'Pending',  y: 28, color: '#f59e0b' },
              { name: 'Under Review', y: 18, color: '#3b82f6' },
              { name: 'Rejected', y: 12, color: '#ef4444' }
            ]
      }]
    };
  }

  private buildBar(
    categories: string[], normal: number[], urgent: number[], emergency: number[]
  ): Highcharts.Options {
    return {
      chart: { type: 'column', height: 380, backgroundColor: '#ffffff' },
      title: { text: 'Monthly Requests by Priority', align: 'left',
        style: { color: '#111827', fontSize: '15px', fontWeight: '600' } },
      xAxis: {
        categories: categories.length > 0 ? categories : ['Jan','Feb','Mar','Apr','May','Jun'],
        lineColor: '#e5e7eb', tickColor: '#e5e7eb',
        labels: { style: { color: '#6b7280', fontSize: '12px' } }
      },
      yAxis: { min: 0, gridLineColor: '#f3f4f6',
        title: { text: 'Requests', style: { color: '#9ca3af', fontSize: '12px' } },
        labels: { style: { color: '#6b7280', fontSize: '12px' } } },
      tooltip: { backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: 8,
        shared: true, style: { color: '#111827', fontSize: '13px' },
        headerFormat: '<span style="font-size:12px;color:#6b7280">{point.key}</span><br/>' },
      credits: { enabled: false },
      legend: { align: 'center', verticalAlign: 'bottom',
        itemStyle: { color: '#374151', fontSize: '12px', fontWeight: '400' } },
      plotOptions: {
        column: { stacking: 'normal', pointPadding: 0.15, borderWidth: 0, borderRadius: 4,
          dataLabels: { enabled: true,
            style: { fontSize: '11px', fontWeight: '500', color: '#ffffff', textOutline: 'none' } }
        }
      },
      series: [
        { type: 'column', name: 'Emergency',
          data: emergency.length > 0 ? emergency : [4,6,3,5,7,4], color: '#ef4444' },
        { type: 'column', name: 'Urgent',
          data: urgent.length > 0 ? urgent : [10,8,12,9,11,10], color: '#f59e0b' },
        { type: 'column', name: 'Normal',
          data: normal.length > 0 ? normal : [18,22,20,24,21,25], color: '#3b82f6' }
      ]
    };
  }
}
