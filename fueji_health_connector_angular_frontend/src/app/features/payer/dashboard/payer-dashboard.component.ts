import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize, forkJoin } from 'rxjs';
import { LayoutModule } from '../../../shared/components/layout/layout.module';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

interface PendingItem {
  authId: string;
  procedure: string;
  provider: string;
  risk: 'High' | 'Med' | 'Low';
  aiScore: number;
  waitTime: string;
}

interface DonutSegment {
  label: string;
  percent: number;
  count: number;
  color: string;
  offset: number;
}

interface PerformanceMetric {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-payer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-screen overflow-hidden bg-gray-50">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Right column -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <!-- Header -->
        <app-header></app-header>

        <!-- Scrollable main content -->
        <main class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          <!-- ============================================================
               HERO BANNER
          ============================================================ -->
          <section
            class="rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden"
            style="background: linear-gradient(135deg, #0f766e 0%, #1d4ed8 100%);"
          >
            <!-- Decorative background circles -->
            <div
              class="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white opacity-10 pointer-events-none"
            ></div>
            <div
              class="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-white opacity-10 pointer-events-none"
            ></div>

            <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div>
                <h1 class="text-2xl md:text-3xl font-bold mb-1 tracking-tight">
                  Good {{ timeOfDay }}, {{ userName }}
                </h1>
                <p class="text-teal-100 text-sm md:text-base leading-relaxed">
                  @if (pendingQueue > 0) {
                  <span class="font-semibold text-white">{{ pendingQueue }} authorization{{ pendingQueue === 1 ? '' : 's' }}</span> awaiting your decision
                  } @else {
                  No authorizations pending. All caught up!
                  }
                </p>
              </div>
              <div class="flex flex-wrap gap-3 shrink-0">
                <button
                  [routerLink]="['/payer/review']"
                  class="px-5 py-2.5 bg-white text-teal-700 font-semibold rounded-lg shadow
                         hover:bg-teal-50 active:scale-95 transition-all text-sm"
                >
                  Open Review Queue
                </button>
                <button
                  [routerLink]="['/payer/analytics']"
                  class="px-5 py-2.5 bg-white/20 border border-white/40 text-white font-semibold rounded-lg
                         hover:bg-white/30 active:scale-95 transition-all text-sm"
                >
                  Analytics
                </button>
              </div>
            </div>
          </section>

          <!-- ============================================================
               KPI CARDS
          ============================================================ -->
          <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">

            <!-- Pending Review (live) -->
            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-2">
              <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Pending Review</span>
              <div class="flex items-center gap-2">
                <span class="text-3xl font-bold text-amber-500">{{ pendingQueue }}</span>
                <span
                  class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0"
                  title="Live data"
                ></span>
              </div>
              <span class="text-xs text-gray-400 truncate">Updated {{ lastUpdated }}</span>
            </div>

            <!-- Total Approved -->
            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-2">
              <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Total Approved</span>
              <span class="text-3xl font-bold text-emerald-600">{{ approvedToday }}</span>
              <span class="text-xs text-gray-400">All time approvals</span>
            </div>

            <!-- Avg Review Time -->
            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-2">
              <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Avg Review Time</span>
              <span class="text-3xl font-bold text-blue-600">
                --<span class="text-lg font-medium ml-0.5">h</span>
              </span>
              <span class="text-xs text-gray-400">No data yet</span>
            </div>

            <!-- Approval Rate -->
            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-2">
              <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Approval Rate</span>
              <span class="text-3xl font-bold text-teal-600">
                {{ approvalRate }}<span class="text-lg font-medium ml-0.5">%</span>
              </span>
              <div class="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                <div
                  class="bg-teal-500 h-1.5 rounded-full transition-all duration-700"
                  [style.width.%]="approvalRate"
                ></div>
              </div>
            </div>
          </section>

          <!-- ============================================================
               CHARTS ROW: Area Chart + Donut
          ============================================================ -->
          <section class="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <!-- SVG AREA CHART -->
            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
              <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 class="font-semibold text-gray-700 text-sm">Decision Volume &mdash; Last 12 Months</h2>
                <div class="flex gap-4 text-xs">
                  <span class="flex items-center gap-1.5 text-gray-500">
                    <span class="inline-block w-3 h-0.5 bg-emerald-500 rounded"></span>Approved
                  </span>
                  <span class="flex items-center gap-1.5 text-gray-500">
                    <span class="inline-block w-3 h-0.5 bg-red-400 rounded"></span>Denied
                  </span>
                </div>
              </div>

              <svg viewBox="0 0 520 185" class="w-full flex-1" style="min-height:150px;"
                   preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stop-color="#10b981" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#10b981" stop-opacity="0.02"/>
                  </linearGradient>
                  <linearGradient id="deniedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stop-color="#ef4444" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#ef4444" stop-opacity="0.02"/>
                  </linearGradient>
                </defs>

                <!-- Horizontal grid lines -->
                <line x1="0" y1="20"  x2="520" y2="20"  stroke="#f3f4f6" stroke-width="1"/>
                <line x1="0" y1="55"  x2="520" y2="55"  stroke="#f3f4f6" stroke-width="1"/>
                <line x1="0" y1="90"  x2="520" y2="90"  stroke="#f3f4f6" stroke-width="1"/>
                <line x1="0" y1="125" x2="520" y2="125" stroke="#f3f4f6" stroke-width="1"/>
                <line x1="0" y1="160" x2="520" y2="160" stroke="#f3f4f6" stroke-width="1"/>

                <!-- Approved area fill -->
                <path [attr.d]="approvedAreaPath" fill="url(#approvedGrad)"/>
                <!-- Approved line -->
                <path [attr.d]="approvedLinePath" fill="none" stroke="#10b981"
                      stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>

                <!-- Denied area fill -->
                <path [attr.d]="deniedAreaPath" fill="url(#deniedGrad)"/>
                <!-- Denied line -->
                <path [attr.d]="deniedLinePath" fill="none" stroke="#ef4444"
                      stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>

                <!-- Month labels -->
                <g fill="#9ca3af" font-size="9" font-family="inherit">
                  @for (m of monthLabels; track m; let i = $index) {
                    <text [attr.x]="getX(i)" y="178" text-anchor="middle">{{ m }}</text>
                  }
                </g>
              </svg>
            </div>

            <!-- STATUS BREAKDOWN DONUT -->
            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col">
              <h2 class="font-semibold text-gray-700 text-sm mb-4">Status Breakdown</h2>

              <div class="flex flex-col items-center gap-5 flex-1 justify-center">
                <svg viewBox="0 0 160 160" class="w-36 h-36">
                  @for (seg of donutSegments; track seg.label) {
                    <g>
                      <circle
                        cx="80" cy="80" r="60"
                        fill="none"
                        [attr.stroke]="seg.color"
                        stroke-width="22"
                        [attr.stroke-dasharray]="getDonutDash(seg.percent)"
                        [attr.stroke-dashoffset]="getDonutOffset(seg.offset)"
                        transform="rotate(-90 80 80)"
                      />
                    </g>
                  }
                  <!-- Centre label -->
                  <text x="80" y="76" text-anchor="middle" font-size="20"
                        font-weight="700" fill="#111827">{{ approvalRate }}%</text>
                  <text x="80" y="92" text-anchor="middle" font-size="9"
                        fill="#6b7280">Approval</text>
                </svg>

                <!-- Legend -->
                <div class="w-full space-y-2">
                  @for (seg of donutSegments; track seg.label) {
                    <div class="flex items-center justify-between text-xs">
                      <span class="flex items-center gap-1.5 text-gray-600">
                        <span class="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                              [style.background-color]="seg.color"></span>
                        {{ seg.label }}
                      </span>
                      <span class="font-semibold text-gray-700">{{ seg.count | number }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </section>

          <!-- ============================================================
               PENDING REVIEW TABLE
          ============================================================ -->
          <section class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 class="font-semibold text-gray-700 text-sm">Pending Review Queue</h2>
                <p class="text-xs text-gray-400 mt-0.5">Requires your decision</p>
              </div>
              <button class="text-xs text-teal-600 font-medium hover:underline">View all</button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                    <th class="px-5 py-3 text-left font-medium">Auth ID</th>
                    <th class="px-5 py-3 text-left font-medium">Procedure</th>
                    <th class="px-5 py-3 text-left font-medium hidden md:table-cell">Provider</th>
                    <th class="px-5 py-3 text-left font-medium">Risk</th>
                    <th class="px-5 py-3 text-left font-medium hidden lg:table-cell">AI Score</th>
                    <th class="px-5 py-3 text-left font-medium hidden md:table-cell">Wait</th>
                    <th class="px-5 py-3 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  @for (item of pendingItems; track item.authId) {
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-5 py-3 font-mono text-gray-600 text-xs whitespace-nowrap">
                        {{ item.authId }}
                      </td>
                      <td class="px-5 py-3 text-gray-700 font-medium max-w-35 truncate">
                        {{ item.procedure }}
                      </td>
                      <td class="px-5 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                        {{ item.provider }}
                      </td>
                      <td class="px-5 py-3">
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
                          [ngClass]="{
                            'bg-red-100 text-red-700':         item.risk === 'High',
                            'bg-amber-100 text-amber-700':     item.risk === 'Med',
                            'bg-emerald-100 text-emerald-700': item.risk === 'Low'
                          }">
                          {{ item.risk }}
                        </span>
                      </td>
                      <td class="px-5 py-3 hidden lg:table-cell">
                        <div class="flex items-center gap-2">
                          <div class="w-20 bg-gray-100 rounded-full h-1.5">
                            <div
                              class="h-1.5 rounded-full"
                              [style.width.%]="item.aiScore"
                              [ngClass]="{
                                'bg-emerald-500': item.aiScore >= 70,
                                'bg-amber-400':   item.aiScore >= 40 && item.aiScore < 70,
                                'bg-red-400':     item.aiScore < 40
                              }"
                            ></div>
                          </div>
                          <span class="text-xs text-gray-500 whitespace-nowrap">{{ item.aiScore }}%</span>
                        </div>
                      </td>
                      <td class="px-5 py-3 text-xs text-gray-400 hidden md:table-cell whitespace-nowrap">
                        {{ item.waitTime }}
                      </td>
                      <td class="px-5 py-3">
                        <button (click)="goToReview()"
                          class="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50
                                 rounded-lg hover:bg-teal-100 active:scale-95 transition-all whitespace-nowrap"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  }
                  @if (pendingItems.length === 0) {
                  <tr>
                    <td colspan="7" class="px-5 py-8 text-center text-sm text-gray-400">
                      No pending items in the review queue
                    </td>
                  </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <!-- ============================================================
               PERFORMANCE METRICS
          ============================================================ -->
          <section class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 class="font-semibold text-gray-700 text-sm mb-5">Performance Metrics</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              @for (metric of performanceMetrics; track metric.label) {
                <div class="space-y-1.5">
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-600 font-medium">{{ metric.label }}</span>
                    <span class="font-bold" [style.color]="metric.color">{{ metric.value }}%</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      class="h-2.5 rounded-full transition-all duration-700"
                      [style.width.%]="metric.value"
                      [style.background-color]="metric.color"
                    ></div>
                  </div>
                </div>
              }
            </div>
          </section>

        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }
  `],
})
export class PayerDashboardComponent implements OnInit, OnDestroy {
  // ------------------------------------------------------------------ state
  timeOfDay    = 'morning';
  userName     = 'there';
  pendingQueue = 0;
  approvalRate = 0;
  approvedToday = 0;
  lastUpdated  = 'just now';

  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private tickSeconds = 0;

  private readonly MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // ------------------------------------------------------------------ chart data
  monthLabels: string[] = this.buildMonthLabels();

  private approvedData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  private deniedData   = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  private readonly SVG_WIDTH  = 520;
  private readonly SVG_TOP    = 15;
  private readonly SVG_BOTTOM = 160;
  private readonly SVG_PAD    = 20;

  approvedLinePath = '';
  approvedAreaPath = '';
  deniedLinePath   = '';
  deniedAreaPath   = '';

  // ------------------------------------------------------------------ donut
  readonly donutSegments: DonutSegment[] = [
    { label: 'Approved',  percent: 0, count: 0, color: '#10b981', offset: 0  },
    { label: 'Pending',   percent: 0, count: 0, color: '#f59e0b', offset: 0  },
    { label: 'Denied',    percent: 0, count: 0, color: '#ef4444', offset: 0  },
    { label: 'More Info', percent: 0, count: 0, color: '#3b82f6', offset: 0  },
  ];

  // ------------------------------------------------------------------ table
  pendingItems: PendingItem[] = [];

  // ------------------------------------------------------------------ metrics
  performanceMetrics: PerformanceMetric[] = [
    { label: 'Approval Rate',    value: 0, color: '#10b981' },
    { label: 'Rejection Rate',   value: 0, color: '#ef4444' },
    { label: 'Pending (% total)',value: 0, color: '#f59e0b' },
    { label: 'Under Review (%)', value: 0, color: '#3b82f6' },
  ];

  // ------------------------------------------------------------------ constructor
  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  // ------------------------------------------------------------------ lifecycle
  private refreshId: any;

  ngOnInit(): void {
    this.setTimeOfDay();
    this.setUserName();
    this.buildChartPaths();
    this.startLiveTick();
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboard();
      this.refreshId = setInterval(() => this.loadDashboard(), 30000);
    }
  }

  private loadDashboard(): void {
    forkJoin({
      stats: this.http.get<any>(`${environment.apiUrl}/api/analytics/payer/dashboard`),
      queue: this.http.get<any>(`${environment.apiUrl}/api/authorizations/queue?size=10&page=0`)
    }).pipe(finalize(() => this.cdr.detectChanges()))
      .subscribe({
        next: ({ stats, queue }) => {
          const d = stats?.data;
          if (d) {
            const approved  = d.approvedCount         ?? 0;
            const pending   = d.pendingReviewCount     ?? 0;
            const rejected  = d.rejectedCount          ?? 0;
            const moreInfo  = d.moreInfoRequiredCount  ?? 0;
            const under     = d.underReviewCount       ?? 0;
            const totalAll  = approved + pending + rejected + moreInfo + under || 1;

            this.pendingQueue  = pending;
            this.approvalRate  = Math.round(d.approvalPercentage ?? 0);
            this.approvedToday = approved;
            this.lastUpdated   = 'just now';

            // Donut
            this.donutSegments[0].percent = Math.round(approved / totalAll * 100);
            this.donutSegments[0].count   = approved;
            this.donutSegments[1].percent = Math.round(pending  / totalAll * 100);
            this.donutSegments[1].count   = pending;
            this.donutSegments[2].percent = Math.round(rejected / totalAll * 100);
            this.donutSegments[2].count   = rejected;
            this.donutSegments[3].percent = Math.round(moreInfo / totalAll * 100);
            this.donutSegments[3].count   = moreInfo;

            // Performance metrics — real percentages
            this.performanceMetrics[0].value = Math.round(d.approvalPercentage  ?? 0);
            this.performanceMetrics[1].value = Math.round(d.rejectionPercentage ?? 0);
            this.performanceMetrics[2].value = Math.round(pending  / totalAll * 100);
            this.performanceMetrics[3].value = Math.round(under    / totalAll * 100);

            // Monthly chart from breakdown data
            if (d.monthlyBreakdown?.length) {
              const approvedMap: Record<string, number> = {};
              const rejectedMap: Record<string, number> = {};
              for (const row of d.monthlyBreakdown) {
                const id = row._id ?? row;
                if (id?.year != null && id?.month != null) {
                  const key = `${id.year}-${String(id.month).padStart(2, '0')}`;
                  if (id.status === 'APPROVED')  approvedMap[key] = (approvedMap[key] || 0) + (row.count || 0);
                  if (id.status === 'REJECTED')  rejectedMap[key] = (rejectedMap[key] || 0) + (row.count || 0);
                }
              }
              const now = new Date();
              this.monthLabels = this.buildMonthLabels();
              this.approvedData = Array.from({ length: 12 }, (_, i) => {
                const dt  = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
                const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
                return approvedMap[key] || 0;
              });
              this.deniedData = Array.from({ length: 12 }, (_, i) => {
                const dt  = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
                const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
                return rejectedMap[key] || 0;
              });
              this.buildChartPaths();
            }
          }
          const items: any[] = queue?.data?.content ?? queue?.data ?? [];
          this.pendingItems = items.map((a: any) => ({
            authId:    a.referenceNumber ?? a.id ?? '',
            procedure: a.procedureDescription ?? a.procedureCode ?? '',
            provider:  a.providerName ?? '',
            risk:      this.mapRisk(a.aiRiskLevel),
            aiScore:   a.aiScore ?? 0,
            waitTime:  this.calcWait(a.submittedAt),
          }));
        },
        error: () => {}
      });
  }

  private mapRisk(level: string | null): 'High' | 'Med' | 'Low' {
    if (level === 'HIGH') return 'High';
    if (level === 'LOW')  return 'Low';
    return 'Med';
  }

  private calcWait(submittedAt: string | null): string {
    if (!submittedAt) return '--';
    const diff = Date.now() - new Date(submittedAt).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return '< 1h';
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  }

  goToReview(): void { this.router.navigate(['/payer/review']); }

  ngOnDestroy(): void {
    if (this.tickInterval !== null) { clearInterval(this.tickInterval); this.tickInterval = null; }
    if (this.refreshId)             { clearInterval(this.refreshId); }
  }

  // ------------------------------------------------------------------ month labels
  private buildMonthLabels(): string[] {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return this.MONTH_NAMES[d.getMonth()];
    });
  }

  // ------------------------------------------------------------------ time helpers
  private setTimeOfDay(): void {
    const h = new Date().getHours();
    if (h < 12)      this.timeOfDay = 'morning';
    else if (h < 17) this.timeOfDay = 'afternoon';
    else             this.timeOfDay = 'evening';
  }

  private setUserName(): void {
    try {
      const user = this.authService.getCurrentUser?.() ?? null;
      if (user?.firstName) {
        this.userName = user.firstName;
      } else if ((user as any)?.name) {
        this.userName = ((user as any).name as string).split(' ')[0];
      } else {
        this.userName = 'there';
      }
    } catch {
      this.userName = 'there';
    }
  }

  // ------------------------------------------------------------------ SVG area chart
  /** Returns the SVG X coordinate for a given data index (0-based). */
  getX(index: number): number {
    const count = this.approvedData.length;
    return (
      this.SVG_PAD +
      (index / (count - 1)) * (this.SVG_WIDTH - this.SVG_PAD * 2)
    );
  }

  private getY(value: number, maxVal: number): number {
    const range = this.SVG_BOTTOM - this.SVG_TOP;
    return this.SVG_BOTTOM - (value / maxVal) * range;
  }

  private buildChartPaths(): void {
    const maxVal = Math.max(...this.approvedData) * 1.15;

    const approvedPts = this.approvedData.map((v, i) => ({
      x: this.getX(i),
      y: this.getY(v, maxVal),
    }));
    const deniedPts = this.deniedData.map((v, i) => ({
      x: this.getX(i),
      y: this.getY(v, maxVal),
    }));

    this.approvedLinePath = this.buildLine(approvedPts);
    this.approvedAreaPath = this.buildArea(approvedPts, this.SVG_BOTTOM);
    this.deniedLinePath   = this.buildLine(deniedPts);
    this.deniedAreaPath   = this.buildArea(deniedPts, this.SVG_BOTTOM);
  }

  private buildLine(pts: { x: number; y: number }[]): string {
    if (!pts.length) return '';
    return pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ');
  }

  private buildArea(pts: { x: number; y: number }[], baseY: number): string {
    if (!pts.length) return '';
    const line  = this.buildLine(pts);
    const last  = pts[pts.length - 1];
    const first = pts[0];
    return `${line} L${last.x.toFixed(1)},${baseY} L${first.x.toFixed(1)},${baseY} Z`;
  }

  // ------------------------------------------------------------------ donut helpers
  /** Returns stroke-dasharray value for a donut segment expressed as a percentage. */
  getDonutDash(percent: number): string {
    const circumference = 2 * Math.PI * 60; // r = 60
    const dash = (percent / 100) * circumference;
    return `${dash.toFixed(2)} ${circumference.toFixed(2)}`;
  }

  /**
   * Returns stroke-dashoffset so the segment begins at startPercent along the circle.
   * Combined with rotate(-90) on the <g>, 0% is at the top.
   */
  getDonutOffset(startPercent: number): string {
    const circumference = 2 * Math.PI * 60;
    return (-(startPercent / 100) * circumference).toFixed(2);
  }

  // ------------------------------------------------------------------ live tick
  private startLiveTick(): void {
    this.ngZone.runOutsideAngular(() => {
      this.tickInterval = setInterval(() => {
        this.ngZone.run(() => {
          this.tickSeconds += 10;

          // Human-readable "last updated" label
          if (this.tickSeconds < 60) {
            this.lastUpdated = `${this.tickSeconds}s ago`;
          } else {
            const mins = Math.floor(this.tickSeconds / 60);
            this.lastUpdated = `${mins}m ago`;
          }

          this.cdr.markForCheck();
        });
      }, 10_000);
    });
  }
}
