import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LayoutModule } from '../../../shared/components/layout/layout.module';
import { environment } from '../../../../environments/environment';

interface KpiCard {
  label: string;
  displayValue: number;
  targetValue: number;
  suffix: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  gradient: string;
}

interface BarItem {
  label: string;
  value: number;
  color: string;
  animatedHeight: number;
}

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LayoutModule],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-50">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col min-w-0">
        <app-header></app-header>
        <main class="flex-1 overflow-y-auto px-4 md:px-6 py-8">
          <div class="max-w-7xl mx-auto">

            <!-- Header -->
            <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Analytics</h1>
                <p class="text-gray-500 mt-1">Real-time platform metrics and performance insights</p>
              </div>
              <button (click)="reload()"
                      class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-sm text-sm">
                <svg class="w-4 h-4" [class.animate-spin]="loading" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Refresh
              </button>
            </div>

            @if (loading) {
              <!-- Skeleton -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
                @for (i of [1,2,3,4]; track i) {
                  <div class="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                    <div class="h-3 bg-gray-200 rounded w-20 mb-3"></div>
                    <div class="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                    <div class="h-2 bg-gray-100 rounded w-24"></div>
                  </div>
                }
              </div>
            } @else {

            <!-- ── Row 1: Request KPIs ── -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
              @for (kpi of requestKpis; track kpi.label) {
              <div class="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200">
                <div class="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl" [style.background]="kpi.gradient"></div>
                <div class="flex items-start justify-between mb-3">
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ kpi.label }}</p>
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" [ngClass]="kpi.iconBg">
                    <svg class="w-4.5 h-4.5 w-5 h-5" [ngClass]="kpi.iconColor" fill="currentColor" viewBox="0 0 24 24">
                      <path [attr.d]="kpi.icon"/>
                    </svg>
                  </div>
                </div>
                <p class="text-3xl font-extrabold text-gray-900 tabular-nums">
                  {{ kpi.displayValue.toLocaleString() }}{{ kpi.suffix }}
                </p>
              </div>
              }
            </div>

            <!-- ── Row 2: User KPIs ── -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
              @for (kpi of userKpis; track kpi.label) {
              <div class="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200">
                <div class="flex items-start justify-between mb-3">
                  <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ kpi.label }}</p>
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" [ngClass]="kpi.iconBg">
                    <svg class="w-5 h-5" [ngClass]="kpi.iconColor" fill="currentColor" viewBox="0 0 24 24">
                      <path [attr.d]="kpi.icon"/>
                    </svg>
                  </div>
                </div>
                <p class="text-3xl font-extrabold text-gray-900 tabular-nums">{{ kpi.displayValue.toLocaleString() }}</p>
              </div>
              }
            </div>

            <!-- ── Row 3: Charts ── -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

              <!-- Bar Chart: Request Status Distribution -->
              <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="text-base font-bold text-gray-900">Authorization Status Breakdown</h3>
                </div>
                <p class="text-xs text-gray-400 mb-6">Current distribution across all request statuses</p>

                <div class="flex items-end gap-3 h-44">
                  @for (bar of statusBars; track bar.label) {
                  <div class="flex-1 flex flex-col items-center gap-2 group">
                    <div class="relative w-full flex flex-col justify-end" style="height: 160px">
                      <div class="w-full rounded-t-lg transition-all duration-1000 ease-out relative overflow-hidden"
                           [style.height.px]="bar.animatedHeight"
                           [style.background]="bar.color"
                           [style.min-height.px]="bar.value > 0 ? 4 : 0">
                        <!-- shine effect -->
                        <div class="absolute inset-0 bg-white opacity-20 rounded-t-lg" style="background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 60%)"></div>
                      </div>
                    </div>
                    <div class="text-center">
                      <p class="text-xs font-bold text-gray-800 tabular-nums">{{ bar.value }}</p>
                      <p class="text-xs text-gray-400 mt-0.5 whitespace-nowrap">{{ bar.label }}</p>
                    </div>
                  </div>
                  }
                </div>

                <!-- Legend -->
                <div class="flex flex-wrap gap-x-4 gap-y-1 mt-4 pt-4 border-t border-gray-50">
                  @for (bar of statusBars; track bar.label) {
                  <div class="flex items-center gap-1.5">
                    <div class="w-2.5 h-2.5 rounded-sm" [style.background]="bar.color"></div>
                    <span class="text-xs text-gray-500">{{ bar.label }}</span>
                  </div>
                  }
                </div>
              </div>

              <!-- Donut: Approval Rate -->
              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                <h3 class="text-base font-bold text-gray-900 mb-1">Approval Rate</h3>
                <p class="text-xs text-gray-400 mb-4">Overall approved vs total reviewed</p>

                <div class="flex-1 flex items-center justify-center">
                  <div class="relative w-36 h-36">
                    <svg viewBox="0 0 120 120" class="w-36 h-36 -rotate-90">
                      <circle cx="60" cy="60" r="46" fill="none" stroke="#f3f4f6" stroke-width="12"/>
                      <!-- Approved arc -->
                      <circle cx="60" cy="60" r="46" fill="none" stroke="#3b82f6" stroke-width="12"
                              stroke-linecap="round"
                              [attr.stroke-dasharray]="289"
                              [attr.stroke-dashoffset]="289 - (approvalRate / 100) * 289"
                              style="transition: stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)"/>
                      <!-- Rejected arc -->
                      <circle cx="60" cy="60" r="46" fill="none" stroke="#f87171" stroke-width="12"
                              stroke-linecap="round"
                              [attr.stroke-dasharray]="289"
                              [attr.stroke-dashoffset]="289 - (rejectionRate / 100) * 289"
                              [attr.stroke-dasharray]="289 - (approvalRate / 100) * 289 + ' ' + 289"
                              style="transform-origin: center; transition: all 1.4s ease"
                              [style.transform]="'rotate(' + (approvalRate / 100 * 360) + 'deg)'"/>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                      <span class="text-3xl font-extrabold text-gray-900 tabular-nums">{{ displayApprovalRate }}%</span>
                      <span class="text-xs text-gray-400 font-medium">Approved</span>
                    </div>
                  </div>
                </div>

                <div class="space-y-2.5 mt-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-blue-500"></div><span class="text-xs text-gray-600">Approved</span></div>
                    <div class="flex items-center gap-1"><span class="text-xs font-bold text-gray-900">{{ approvedRequests }}</span><span class="text-xs text-gray-400">({{ approvalRate }}%)</span></div>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-red-400"></div><span class="text-xs text-gray-600">Rejected</span></div>
                    <div class="flex items-center gap-1"><span class="text-xs font-bold text-gray-900">{{ rejectedRequests }}</span><span class="text-xs text-gray-400">({{ rejectionRate }}%)</span></div>
                  </div>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-amber-400"></div><span class="text-xs text-gray-600">Pending</span></div>
                    <div class="flex items-center gap-1"><span class="text-xs font-bold text-gray-900">{{ pendingRequests }}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Row 4: Progress Metrics + AI ── -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <!-- Request Pipeline Progress Bars -->
              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 class="text-base font-bold text-gray-900 mb-1">Request Pipeline</h3>
                <p class="text-xs text-gray-400 mb-5">Volume at each stage of the authorization workflow</p>
                <div class="space-y-4">
                  @for (stage of pipelineStages; track stage.label) {
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <div class="flex items-center gap-2">
                        <div class="w-2.5 h-2.5 rounded-full" [style.background]="stage.color"></div>
                        <span class="text-xs font-medium text-gray-700">{{ stage.label }}</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-xs font-bold text-gray-900 tabular-nums">{{ stage.value }}</span>
                        <span class="text-xs text-gray-400">({{ totalRequests > 0 ? ((stage.value / totalRequests) * 100 | number:'1.0-0') : 0 }}%)</span>
                      </div>
                    </div>
                    <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-1000 ease-out"
                           [style.width.%]="totalRequests > 0 ? (stage.value / totalRequests) * 100 : 0"
                           [style.background]="stage.color"
                           [class.w-0]="!animateProgress">
                      </div>
                    </div>
                  </div>
                  }
                </div>
              </div>

              <!-- AI Performance -->
              <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 class="text-base font-bold text-gray-900 mb-1">AI Copilot Performance</h3>
                <p class="text-xs text-gray-400 mb-5">Gemini AI review accuracy and usage statistics</p>

                <div class="space-y-4 mb-5">
                  @for (m of aiMetrics; track m.label) {
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="text-xs font-medium text-gray-700">{{ m.label }}</span>
                      <span class="text-xs font-bold" [style.color]="m.color">{{ m.display }}</span>
                    </div>
                    <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-1000 ease-out"
                           [style.width.%]="m.animated"
                           [style.background]="m.color">
                      </div>
                    </div>
                  </div>
                  }
                </div>

                <!-- AI stats grid -->
                <div class="grid grid-cols-3 gap-3 pt-5 border-t border-gray-100">
                  <div class="text-center bg-blue-50 rounded-xl p-3">
                    <p class="text-xl font-extrabold text-blue-700 tabular-nums">{{ displayAiUsage }}</p>
                    <p class="text-xs text-blue-500 mt-0.5 font-medium">Cases</p>
                  </div>
                  <div class="text-center bg-purple-50 rounded-xl p-3">
                    <p class="text-xl font-extrabold text-purple-700">
                      {{ averageApprovalTimeHours != null ? (averageApprovalTimeHours | number:'1.1-1') + 'h' : '—' }}
                    </p>
                    <p class="text-xs text-purple-500 mt-0.5 font-medium">Avg Time</p>
                  </div>
                  <div class="text-center bg-green-50 rounded-xl p-3">
                    <p class="text-xl font-extrabold text-green-700">
                      {{ aiAccuracyPercentage != null ? (aiAccuracyPercentage | number:'1.0-0') + '%' : '—' }}
                    </p>
                    <p class="text-xs text-green-500 mt-0.5 font-medium">Accuracy</p>
                  </div>
                </div>
              </div>
            </div>

            } <!-- end @else -->

          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: contents; }
  `]
})
export class AdminAnalyticsComponent implements OnInit {
  loading = true;

  // Raw values
  totalRequests = 0;
  approvedRequests = 0;
  rejectedRequests = 0;
  pendingRequests = 0;
  underReviewRequests = 0;
  draftRequests = 0;
  aiUsageCount = 0;
  totalProviders = 0;
  totalPayers = 0;
  activeUsers = 0;
  blockedUsers = 0;
  averageApprovalTimeHours: number | null = null;
  aiAccuracyPercentage: number | null = null;

  // Animated display values
  approvalRate = 0;
  rejectionRate = 0;
  displayApprovalRate = 0;
  displayAiUsage = 0;
  animateProgress = false;

  requestKpis: KpiCard[] = [];
  userKpis: KpiCard[] = [];
  statusBars: BarItem[] = [];
  pipelineStages: { label: string; value: number; color: string }[] = [];
  aiMetrics: { label: string; display: string; percent: number; animated: number; color: string }[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
    }
  }

  reload(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.loadData();
  }

  private loadData(): void {
    this.http.get<any>(`${environment.apiUrl}/api/analytics/admin/dashboard`).subscribe({
      next: (res) => {
        const d = res?.data;
        if (d) this.applyData(d);
        this.loading = false;
        this.cdr.markForCheck();
        // Trigger bar and progress animations after render
        setTimeout(() => {
          this.animateProgress = true;
          this.animateBars();
          this.cdr.markForCheck();
        }, 100);
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private applyData(d: any): void {
    this.totalRequests       = d.totalRequests       ?? 0;
    this.approvedRequests    = d.approvedRequests     ?? 0;
    this.rejectedRequests    = d.rejectedRequests     ?? 0;
    this.pendingRequests     = d.pendingRequests      ?? 0;
    this.underReviewRequests = d.underReviewRequests  ?? 0;
    this.draftRequests       = d.draftRequests        ?? 0;
    this.aiUsageCount        = d.aiUsageCount         ?? 0;
    this.totalProviders      = d.totalProviders       ?? 0;
    this.totalPayers         = d.totalPayers          ?? 0;
    this.activeUsers         = d.activeUsers          ?? 0;
    this.blockedUsers        = d.blockedUsers         ?? 0;
    this.averageApprovalTimeHours = d.averageApprovalTimeHours ?? null;
    this.aiAccuracyPercentage     = d.aiAccuracyPercentage     ?? null;

    const total = this.totalRequests || 1;
    this.approvalRate  = Math.round((this.approvedRequests / total) * 100);
    this.rejectionRate = Math.round((this.rejectedRequests / total) * 100);

    this.requestKpis = [
      {
        label: 'Total Requests', displayValue: 0, targetValue: this.totalRequests, suffix: '',
        icon: 'M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z',
        iconBg: 'bg-blue-50', iconColor: 'text-blue-600', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)'
      },
      {
        label: 'Approved', displayValue: 0, targetValue: this.approvedRequests, suffix: '',
        icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
        iconBg: 'bg-green-50', iconColor: 'text-green-600', gradient: 'linear-gradient(135deg,#10b981,#34d399)'
      },
      {
        label: 'Pending', displayValue: 0, targetValue: this.pendingRequests, suffix: '',
        icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
        iconBg: 'bg-amber-50', iconColor: 'text-amber-600', gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)'
      },
      {
        label: 'AI Reviewed', displayValue: 0, targetValue: this.aiUsageCount, suffix: '',
        icon: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z',
        iconBg: 'bg-purple-50', iconColor: 'text-purple-600', gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)'
      },
    ];

    this.userKpis = [
      {
        label: 'Providers', displayValue: 0, targetValue: this.totalProviders, suffix: '',
        icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.94 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
        iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', gradient: 'linear-gradient(135deg,#6366f1,#818cf8)'
      },
      {
        label: 'Payers', displayValue: 0, targetValue: this.totalPayers, suffix: '',
        icon: 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z',
        iconBg: 'bg-cyan-50', iconColor: 'text-cyan-600', gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)'
      },
      {
        label: 'Active Users', displayValue: 0, targetValue: this.activeUsers, suffix: '',
        icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
        iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', gradient: 'linear-gradient(135deg,#10b981,#34d399)'
      },
      {
        label: 'Blocked', displayValue: 0, targetValue: this.blockedUsers, suffix: '',
        icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z',
        iconBg: 'bg-red-50', iconColor: 'text-red-500', gradient: 'linear-gradient(135deg,#ef4444,#f87171)'
      },
    ];

    this.statusBars = [
      { label: 'Approved',    value: this.approvedRequests,    color: '#3b82f6', animatedHeight: 0 },
      { label: 'Pending',     value: this.pendingRequests,     color: '#f59e0b', animatedHeight: 0 },
      { label: 'Under Review',value: this.underReviewRequests, color: '#8b5cf6', animatedHeight: 0 },
      { label: 'Rejected',    value: this.rejectedRequests,    color: '#f87171', animatedHeight: 0 },
      { label: 'Draft',       value: this.draftRequests,       color: '#94a3b8', animatedHeight: 0 },
    ];

    this.pipelineStages = [
      { label: 'Approved',     value: this.approvedRequests,    color: '#3b82f6' },
      { label: 'Under Review', value: this.underReviewRequests, color: '#8b5cf6' },
      { label: 'Pending',      value: this.pendingRequests,     color: '#f59e0b' },
      { label: 'Rejected',     value: this.rejectedRequests,    color: '#f87171' },
      { label: 'Draft',        value: this.draftRequests,       color: '#94a3b8' },
    ];

    const accuracyVal  = this.aiAccuracyPercentage ?? 0;
    this.aiMetrics = [
      { label: 'AI Review Coverage', display: this.totalRequests > 0 ? Math.min(100, Math.round((this.aiUsageCount / this.totalRequests) * 100)) + '%' : '0%', percent: this.totalRequests > 0 ? Math.min(100, (this.aiUsageCount / this.totalRequests) * 100) : 0, animated: 0, color: '#3b82f6' },
      { label: 'Prediction Accuracy', display: accuracyVal > 0 ? accuracyVal.toFixed(1) + '%' : '—', percent: accuracyVal, animated: 0, color: '#10b981' },
      { label: 'Approval Rate',        display: this.approvalRate + '%', percent: this.approvalRate, animated: 0, color: '#8b5cf6' },
    ];

    // Animate KPI count-ups
    this.requestKpis.forEach(kpi => this.animateCount(kpi, 'displayValue', kpi.targetValue));
    this.userKpis.forEach(kpi => this.animateCount(kpi, 'displayValue', kpi.targetValue));
    this.animateCountProp('displayApprovalRate', this.approvalRate);
    this.animateCountProp('displayAiUsage', this.aiUsageCount);
  }

  private animateBars(): void {
    const maxVal = Math.max(...this.statusBars.map(b => b.value), 1);
    const maxPx  = 140;
    this.statusBars.forEach(bar => {
      bar.animatedHeight = Math.round((bar.value / maxVal) * maxPx);
    });
    this.aiMetrics.forEach(m => { m.animated = m.percent; });
    this.cdr.markForCheck();
  }

  private animateCount(obj: any, prop: string, target: number): void {
    if (!isPlatformBrowser(this.platformId) || target === 0) { obj[prop] = target; return; }
    const duration = 1200;
    const start    = Date.now();
    const step = () => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      obj[prop] = Math.round(target * eased);
      this.cdr.markForCheck();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  private animateCountProp(prop: keyof this & string, target: number): void {
    if (!isPlatformBrowser(this.platformId) || target === 0) { (this as any)[prop] = target; return; }
    const duration = 1200;
    const start    = Date.now();
    const step = () => {
      const t = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      (this as any)[prop] = Math.round(target * eased);
      this.cdr.markForCheck();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
