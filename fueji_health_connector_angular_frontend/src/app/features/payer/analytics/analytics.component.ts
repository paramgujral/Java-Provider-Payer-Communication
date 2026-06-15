import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HeaderComponent } from '../../../shared/components/layout/header/header.component';
import { SidebarComponent } from '../../../shared/components/layout/sidebar/sidebar.component';
import { environment } from '../../../../environments/environment';

interface MonthData { month: string; approved: number; rejected: number; total: number; }
interface RowItem   { name: string; count: number; percent: number; color: string; }

interface PayerAnalytics {
  pendingReviewCount:   number;
  underReviewCount:     number;
  approvedCount:        number;
  rejectedCount:        number;
  moreInfoRequiredCount:number;
  totalReviewedCount:   number;
  approvalPercentage:   number;
  rejectionPercentage:  number;
  providerRanking:      any[];
  monthlyTrend:         any[];
  monthlyBreakdown:     any[];
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-50">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <app-header></app-header>
        <main class="flex-1 overflow-y-auto px-4 md:px-6 py-8">
          <div class="max-w-7xl mx-auto">

            <!-- Page Header -->
            <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p class="text-gray-500 mt-1">Real-time authorization trends, approval rates, and performance metrics</p>
              </div>
              <button (click)="loadAnalytics()"
                      class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Refresh
              </button>
            </div>

            <!-- Loading -->
            @if (loading) {
            <div class="flex items-center justify-center py-32">
              <div class="flex flex-col items-center gap-3">
                <svg class="animate-spin w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <p class="text-sm text-gray-400">Loading analytics…</p>
              </div>
            </div>
            }

            @if (!loading) {

            <!-- KPI Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
              @for (kpi of kpis; track kpi.label) {
              <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div class="flex items-center justify-between mb-3">
                  <p class="text-xs text-gray-500 font-medium">{{ kpi.label }}</p>
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center" [ngClass]="kpi.iconBg">
                    <svg class="w-4 h-4" [ngClass]="kpi.iconColor" fill="currentColor" viewBox="0 0 24 24">
                      <path [attr.d]="kpi.iconPath"/>
                    </svg>
                  </div>
                </div>
                <p class="text-2xl font-bold text-gray-900">{{ kpi.value }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ kpi.sub }}</p>
              </div>
              }
            </div>

            <!-- Charts Row -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              <!-- Bar Chart: Monthly Volume -->
              <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 class="text-base font-bold text-gray-900 mb-1">Monthly Authorization Volume</h3>
                <p class="text-xs text-gray-400 mb-5">Approved vs. Rejected per month (live)</p>

                <div class="flex items-center gap-5 mb-4">
                  <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-full bg-blue-500"></div><span class="text-xs text-gray-600">Approved</span></div>
                  <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-full bg-red-400"></div><span class="text-xs text-gray-600">Rejected</span></div>
                </div>

                @if (monthData.length === 0) {
                <div class="flex items-center justify-center h-40 text-gray-400 text-sm">No review data yet</div>
                } @else {
                <div class="flex items-end gap-2 h-40">
                  @for (d of monthData; track d.month) {
                  <div class="flex-1 flex flex-col items-center gap-1">
                    <div class="w-full flex flex-col-reverse gap-0.5" style="height: 128px">
                      <div class="w-full rounded-t" [style.height.%]="(d.rejected / maxTotal) * 100" style="background: #f87171; min-height: 2px"></div>
                      <div class="w-full rounded-t" [style.height.%]="(d.approved / maxTotal) * 100" style="background: #3b82f6; min-height: 2px"></div>
                    </div>
                    <span class="text-xs text-gray-400">{{ d.month }}</span>
                  </div>
                  }
                </div>
                }
              </div>

              <!-- Donut: Approval Rate -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 class="text-base font-bold text-gray-900 mb-1">Decision Breakdown</h3>
                <p class="text-xs text-gray-400 mb-6">Live approval rate</p>

                <div class="flex items-center justify-center mb-6">
                  <div class="relative w-32 h-32">
                    <svg viewBox="0 0 120 120" class="w-32 h-32 -rotate-90">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" stroke-width="14"/>
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#3b82f6" stroke-width="14"
                              stroke-linecap="round"
                              [attr.stroke-dasharray]="'314 314'"
                              [attr.stroke-dashoffset]="314 - (approvalRate / 100) * 314"
                              style="transition: stroke-dashoffset 1s ease"/>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                      <span class="text-2xl font-extrabold text-gray-900">{{ approvalRate }}%</span>
                      <span class="text-xs text-gray-400">Approval</span>
                    </div>
                  </div>
                </div>

                <div class="space-y-2">
                  @for (c of decisionBreakdown; track c.name) {
                  <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-2">
                      <div class="w-2.5 h-2.5 rounded-full" [style.background]="c.color"></div>
                      <span class="text-gray-600 text-xs">{{ c.name }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-semibold text-gray-900">{{ c.count }}</span>
                      <span class="text-xs text-gray-400">({{ c.percent }}%)</span>
                    </div>
                  </div>
                  }
                </div>
              </div>
            </div>

            <!-- Bottom Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <!-- Top Providers by Volume -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 class="text-base font-bold text-gray-900 mb-1">Top Providers by Volume</h3>
                <p class="text-xs text-gray-400 mb-5">Authorization requests sent to you</p>

                @if (topProviders.length === 0) {
                <div class="flex items-center justify-center py-10 text-gray-400 text-sm">No provider data yet</div>
                } @else {
                <div class="space-y-3">
                  @for (p of topProviders; track p.name) {
                  <div class="flex items-center gap-3">
                    <span class="text-xs text-gray-600 w-28 truncate shrink-0">{{ p.name }}</span>
                    <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-2 rounded-full transition-all duration-700" [style.width]="p.percent + '%'" [style.background]="p.color"></div>
                    </div>
                    <span class="text-xs font-semibold text-gray-700 w-6 text-right">{{ p.count }}</span>
                    <span class="text-xs text-gray-400 w-8 text-right">{{ p.percent }}%</span>
                  </div>
                  }
                </div>
                }
              </div>

              <!-- Authorization Status Summary -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 class="text-base font-bold text-gray-900 mb-1">Authorization Status Summary</h3>
                <p class="text-xs text-gray-400 mb-5">Current breakdown across all statuses</p>

                <div class="space-y-3">
                  @for (s of statusItems; track s.label) {
                  <div class="flex items-center justify-between p-3 rounded-xl" [ngClass]="s.bg">
                    <div class="flex items-center gap-3">
                      <div class="w-2 h-8 rounded-full" [ngClass]="s.bar"></div>
                      <span class="text-sm font-medium text-gray-700">{{ s.label }}</span>
                    </div>
                    <span class="text-lg font-bold" [ngClass]="s.color">{{ s.count }}</span>
                  </div>
                  }
                </div>

                <div class="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span class="text-xs text-gray-500">Total in system</span>
                  <span class="text-sm font-bold text-gray-900">{{ totalAll }}</span>
                </div>
              </div>
            </div>

            } <!-- end !loading -->

          </div>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  loading = true;
  approvalRate = 0;
  maxTotal = 1;
  totalAll = 0;

  kpis: any[] = [];
  monthData: MonthData[] = [];
  decisionBreakdown: RowItem[] = [];
  topProviders: RowItem[] = [];
  statusItems: any[] = [];

  private pollId: any;
  private readonly MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  private readonly COLORS = ['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#6b7280','#ef4444','#14b8a6'];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAnalytics();
      this.pollId = setInterval(() => this.loadAnalytics(), 30000);
    }
  }

  ngOnDestroy(): void {
    if (this.pollId) clearInterval(this.pollId);
  }

  loadAnalytics(): void {
    this.http.get<PayerAnalytics>(`${environment.apiUrl}/api/analytics/payer/dashboard`)
      .subscribe({
        next: data => {
          this.loading = false;
          this.buildCharts(data);
        },
        error: () => { this.loading = false; }
      });
  }

  private buildCharts(data: PayerAnalytics): void {
    this.approvalRate = Math.round(data.approvalPercentage || 0);

    // KPIs
    this.kpis = [
      {
        label: 'Total Reviewed', value: String(data.totalReviewedCount || 0),
        sub: 'Decided cases', iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
        iconPath: 'M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z'
      },
      {
        label: 'Approval Rate', value: (data.approvalPercentage || 0).toFixed(1) + '%',
        sub: 'Of reviewed cases', iconBg: 'bg-green-50', iconColor: 'text-green-600',
        iconPath: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'
      },
      {
        label: 'Pending Review', value: String(data.pendingReviewCount || 0),
        sub: 'Awaiting your review', iconBg: 'bg-orange-50', iconColor: 'text-orange-600',
        iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'
      },
      {
        label: 'Under Review', value: String(data.underReviewCount || 0),
        sub: 'Currently in review', iconBg: 'bg-purple-50', iconColor: 'text-purple-600',
        iconPath: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z'
      },
    ];

    // Decision breakdown
    const approved  = data.approvedCount         || 0;
    const rejected  = data.rejectedCount         || 0;
    const moreInfo  = data.moreInfoRequiredCount  || 0;
    const totalDec  = approved + rejected + moreInfo;
    const pct = (n: number) => totalDec > 0 ? Math.round(n / totalDec * 100) : 0;
    this.decisionBreakdown = [
      { name: 'Approved',   count: approved,  percent: pct(approved),  color: '#3b82f6' },
      { name: 'Rejected',   count: rejected,  percent: pct(rejected),  color: '#f87171' },
      { name: 'More Info',  count: moreInfo,  percent: pct(moreInfo),  color: '#fbbf24' },
    ];

    // Monthly chart — pivot monthlyBreakdown by month+status
    const pivot: Record<string, MonthData> = {};
    for (const row of data.monthlyBreakdown || []) {
      const id = row['_id'] as any;
      if (!id || id.year == null || id.month == null) continue;
      const key  = `${id.year}-${String(id.month).padStart(2, '0')}`;
      const cnt  = (row['count'] as number) || 0;
      if (!pivot[key]) {
        pivot[key] = { month: this.MONTH_NAMES[(id.month as number) - 1], approved: 0, rejected: 0, total: 0 };
      }
      if (id.status === 'APPROVED')  pivot[key].approved += cnt;
      if (id.status === 'REJECTED')  pivot[key].rejected += cnt;
    }
    // Fallback: use monthlyTrend (no per-status split)
    if (Object.keys(pivot).length === 0) {
      for (const row of data.monthlyTrend || []) {
        const id  = row['_id'] as any;
        if (!id) continue;
        const key = `${id.year}-${String(id.month).padStart(2, '0')}`;
        const cnt = (row['count'] as number) || 0;
        pivot[key] = { month: this.MONTH_NAMES[(id.month as number) - 1], approved: cnt, rejected: 0, total: cnt };
      }
    }
    this.monthData = Object.entries(pivot)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, v]) => { v.total = v.approved + v.rejected; return v; });
    this.maxTotal = Math.max(1, ...this.monthData.map(d => d.total));

    // Top providers
    const ranking = data.providerRanking || [];
    const maxVol  = Math.max(1, ...ranking.map((r: any) => r['totalRequests'] || 0));
    this.topProviders = ranking.slice(0, 6).map((r: any, i: number) => ({
      name:    r['providerName'] || r['_id'] || `Provider ${i + 1}`,
      count:   r['totalRequests'] || 0,
      percent: Math.round(((r['totalRequests'] || 0) / maxVol) * 100),
      color:   this.COLORS[i % this.COLORS.length],
    }));

    // Status summary
    const pending  = data.pendingReviewCount    || 0;
    const under    = data.underReviewCount      || 0;
    this.totalAll  = approved + rejected + moreInfo + pending + under;
    this.statusItems = [
      { label: 'Approved',         count: approved, color: 'text-blue-700',   bg: 'bg-blue-50',   bar: 'bg-blue-500' },
      { label: 'Rejected',         count: rejected, color: 'text-red-700',    bg: 'bg-red-50',    bar: 'bg-red-500' },
      { label: 'Needs More Info',  count: moreInfo, color: 'text-yellow-700', bg: 'bg-yellow-50', bar: 'bg-yellow-500' },
      { label: 'Under Review',     count: under,    color: 'text-purple-700', bg: 'bg-purple-50', bar: 'bg-purple-500' },
      { label: 'Pending Review',   count: pending,  color: 'text-orange-700', bg: 'bg-orange-50', bar: 'bg-orange-500' },
    ];
  }
}
