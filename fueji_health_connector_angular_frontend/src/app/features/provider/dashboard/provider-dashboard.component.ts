import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subject, forkJoin, finalize } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { LayoutModule } from '../../../shared/components/layout/layout.module';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

interface KpiCard {
  label: string;
  value: string | number;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  iconPath: string;
}

interface RecentRequest {
  id: string;
  procedure: string;
  patientName: string;
  maskedDob: string;
  aiScore: number;
  status: 'approved' | 'pending' | 'denied' | 'in-review';
  waitTime: string;
}

interface WeeklyBar {
  day: string;
  count: number;
  heightPx: number;
}

interface DonutSegment {
  label: string;
  percent: number;
  count: number;
  color: string;
  dashArray: string;
  dashOffset: string;
}

interface SmartTip {
  text: string;
}

interface AreaPoint {
  x: number;
  y: number;
}

interface YLabel {
  y: number;
  label: string;
}

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-screen overflow-hidden bg-gray-50">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Right Column -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <!-- Header -->
        <app-header></app-header>

        <!-- Scrollable Main Content -->
        <main class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          <!-- ===== HERO BANNER ===== -->
          <section
            class="rounded-2xl p-6 md:p-8 text-white shadow-lg"
            style="background: linear-gradient(135deg, #059669 0%, #0891b2 100%)"
          >
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 class="text-2xl md:text-3xl font-bold mb-1">
                  Good {{ timeOfDay }}, Dr. {{ providerName }}
                </h1>
                <p class="text-white/80 text-sm md:text-base">
                  You have
                  <span class="font-semibold text-amber-200">{{ pendingCount }} authorization requests</span>
                  pending review today.
                </p>
              </div>
              <button
                class="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-5 py-2.5 rounded-xl shadow hover:bg-gray-50 transition-colors text-sm whitespace-nowrap self-start md:self-auto"
                (click)="onNewAuthRequest()"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                + New Authorization Request
              </button>
            </div>
          </section>

          <!-- ===== KPI CARDS ===== -->
          <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            @for (card of kpiCards; track card.label) {
            <div
              class="rounded-xl border p-4 md:p-5 shadow-sm bg-white flex flex-col gap-3"
              [ngClass]="card.borderClass"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-gray-500 uppercase tracking-wide leading-tight">{{ card.label }}</span>
                <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" [ngClass]="card.bgClass">
                  <svg class="w-4 h-4" [ngClass]="card.colorClass" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="card.iconPath"/>
                  </svg>
                </div>
              </div>
              <div class="text-2xl md:text-3xl font-bold text-gray-800">{{ card.value }}</div>
            </div>
            }
          </section>

          <!-- ===== CHARTS ROW ===== -->
          <section class="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <!-- SVG AREA CHART -->
            <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5">
              <h2 class="text-sm font-semibold text-gray-700 mb-4">My Authorization Activity — Last 12 Months</h2>
              <div class="w-full overflow-x-auto">
                <svg
                  viewBox="0 0 540 160"
                  class="w-full"
                  style="min-width:300px"
                  xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35"/>
                      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.02"/>
                    </linearGradient>
                  </defs>

                  <!-- Horizontal grid lines -->
                  @for (gy of areaGridLines; track gy) {
                  <line x1="40" [attr.y1]="gy" x2="530" [attr.y2]="gy"
                        stroke="#e5e7eb" stroke-width="1"/>
                  }

                  <!-- Y-axis labels -->
                  @for (yl of areaYLabels; track yl.y) {
                  <text x="34" [attr.y]="yl.y + 4"
                        fill="#9ca3af" font-size="10" text-anchor="end">{{ yl.label }}</text>
                  }

                  <!-- Area fill -->
                  <path [attr.d]="areaFillPath" fill="url(#blueAreaGrad)"/>

                  <!-- Area line -->
                  <path [attr.d]="areaLinePath"
                        fill="none"
                        stroke="#3b82f6"
                        stroke-width="2.5"
                        stroke-linejoin="round"
                        stroke-linecap="round"/>

                  <!-- Data point dots -->
                  @for (pt of areaPoints; track pt.x) {
                  <circle [attr.cx]="pt.x" [attr.cy]="pt.y"
                          r="4"
                          fill="#fff"
                          stroke="#3b82f6"
                          stroke-width="2"/>
                  }

                  <!-- X-axis month labels -->
                  @for (pt of areaPoints; track pt.x; let i = $index) {
                  <text [attr.x]="pt.x"
                        y="152"
                        fill="#9ca3af"
                        font-size="10"
                        text-anchor="middle">{{ monthLabels[i] }}</text>
                  }
                </svg>
              </div>
            </div>

            <!-- APPROVAL RATE DONUT -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5 flex flex-col">
              <h2 class="text-sm font-semibold text-gray-700 mb-4">Approval Rate</h2>
              <div class="flex flex-col items-center flex-1 justify-center gap-5">
                <div class="relative">
                  <svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
                    <!-- Track -->
                    <circle cx="70" cy="70" r="45"
                            fill="none"
                            stroke="#f3f4f6"
                            stroke-width="18"/>
                    <!-- Segments (rotated so 0deg = top) -->
                    @for (seg of donutSegments; track seg.label) {
                    <circle cx="70" cy="70" r="45"
                            fill="none"
                            [attr.stroke]="seg.color"
                            stroke-width="18"
                            stroke-linecap="butt"
                            [attr.stroke-dasharray]="seg.dashArray"
                            [attr.stroke-dashoffset]="seg.dashOffset"
                            transform="rotate(-90 70 70)"/>
                    }
                    <!-- Center label -->
                    <text x="70" y="65" text-anchor="middle" font-size="24" font-weight="700" fill="#1f2937">{{ approvalRate }}%</text>
                    <text x="70" y="82" text-anchor="middle" font-size="11" fill="#6b7280">Approved</text>
                  </svg>
                </div>
                <!-- Legend -->
                <div class="w-full space-y-2.5">
                  @for (seg of donutSegments; track seg.label) {
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full shrink-0" [style.background]="seg.color"></span>
                      <span class="text-gray-600">{{ seg.label }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-gray-700">{{ seg.percent }}%</span>
                      <span class="text-gray-400">({{ seg.count }})</span>
                    </div>
                  </div>
                  }
                </div>
              </div>
            </div>
          </section>

          <!-- ===== RECENT REQUESTS TABLE ===== -->
          <section class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="px-4 md:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 class="text-sm font-semibold text-gray-700">Recent Authorization Requests</h2>
              <a routerLink="/provider/authorizations"
                 class="text-xs text-blue-600 hover:underline font-medium">View all</a>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th class="px-4 py-3 text-left font-semibold">ID</th>
                    <th class="px-4 py-3 text-left font-semibold">Procedure</th>
                    <th class="px-4 py-3 text-left font-semibold">Patient</th>
                    <th class="px-4 py-3 text-left font-semibold">AI Score</th>
                    <th class="px-4 py-3 text-left font-semibold">Status</th>
                    <th class="px-4 py-3 text-left font-semibold">Wait</th>
                    <th class="px-4 py-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (req of recentRequests; track req.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{{ req.id }}</td>
                    <td class="px-4 py-3 text-gray-700 font-medium" style="max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">{{ req.procedure }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <div class="text-gray-700 text-xs font-medium">{{ req.patientName }}</div>
                      <div class="text-gray-400 text-xs">DOB: {{ req.maskedDob }}</div>
                    </td>
                    <td class="px-4 py-3" style="min-width:110px">
                      <div class="flex items-center gap-2">
                        <div class="flex-1 bg-gray-100 rounded-full overflow-hidden" style="height:8px">
                          <div
                            class="h-full rounded-full"
                            [ngClass]="getScoreBarClass(req.aiScore)"
                            [style.width.%]="req.aiScore">
                          </div>
                        </div>
                        <span class="text-xs font-semibold w-8 text-right" [ngClass]="getScoreTextClass(req.aiScore)">
                          {{ req.aiScore }}%
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            [ngClass]="getStatusBadgeClass(req.status)">
                        {{ getStatusLabel(req.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{{ req.waitTime }}</td>
                    <td class="px-4 py-3">
                      <button
                        class="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                        (click)="onViewRequest(req.id)">
                        View
                      </button>
                    </td>
                  </tr>
                  }
                  @if (recentRequests.length === 0) {
                  <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-sm text-gray-400">
                      No authorization requests yet
                    </td>
                  </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <!-- ===== BOTTOM ROW: AI COPILOT + WEEKLY BARS ===== -->
          <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <!-- AI COPILOT PANEL -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: linear-gradient(135deg, #7c3aed, #a855f7)">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </div>
                <h2 class="text-sm font-semibold text-gray-700">AI Copilot — Smart Tips</h2>
              </div>
              <ul class="space-y-3">
                @for (tip of smartTips; track tip.text) {
                <li class="flex items-start gap-3">
                  <span class="mt-0.5 w-5 h-5 rounded-full bg-purple-100 shrink-0 flex items-center justify-center">
                    <svg class="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L9 14.414l-3.707-3.707a1 1 0 011.414-1.414L9 11.586l6.293-6.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </span>
                  <p class="text-xs text-gray-600 leading-relaxed">{{ tip.text }}</p>
                </li>
                }
                @if (smartTips.length === 0) {
                <li class="text-xs text-gray-400 py-2">No tips available yet. Submit authorization requests to get AI insights.</li>
                }
              </ul>
            </div>

            <!-- WEEKLY BAR CHART (CSS bars) -->
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5">
              <h2 class="text-sm font-semibold text-gray-700 mb-1">This Week — Submissions per Day</h2>
              <p class="text-xs text-gray-400 mb-4">{{ weeklyTotal }} total submissions</p>
              <div class="flex items-end justify-around gap-2" style="height: 100px">
                @for (bar of weeklyBars; track bar.day) {
                <div class="flex flex-col items-center gap-1 flex-1">
                  <span class="text-xs font-semibold text-gray-600">{{ bar.count }}</span>
                  <div class="w-full rounded-t-md"
                       [ngClass]="getWeeklyBarColorClass(bar.count)"
                       [style.height.px]="bar.heightPx"
                       style="min-height: 4px; transition: height 0.5s ease">
                  </div>
                  <span class="text-xs text-gray-400 font-medium">{{ bar.day }}</span>
                </div>
                }
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        overflow: hidden;
      }
    `,
  ],
})
export class ProviderDashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // Provider info
  providerName = '';
  pendingCount = 0;
  approvalRate = 0;

  // Month labels for area chart — last 12 months relative to today
  monthLabels: string[] = this.buildMonthLabels();

  // Area chart computed values
  activityData: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  areaPoints: AreaPoint[] = [];
  areaLinePath = '';
  areaFillPath = '';
  areaGridLines: number[] = [];
  areaYLabels: YLabel[] = [];

  // KPI cards
  kpiCards: KpiCard[] = [
    {
      label: 'Submitted This Month',
      value: 0,
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-100',
      iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      label: 'Pending Review',
      value: 0,
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-100',
      iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Approved',
      value: 0,
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-100',
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Avg AI Score',
      value: '--',
      colorClass: 'text-purple-600',
      bgClass: 'bg-purple-50',
      borderClass: 'border-purple-100',
      iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    },
  ];

  // Donut segments
  donutSegments: DonutSegment[] = [];
  private readonly donutR = 45;
  private readonly donutCircumference = 2 * Math.PI * this.donutR;

  // Recent requests
  recentRequests: RecentRequest[] = [];

  // AI Copilot smart tips
  smartTips: SmartTip[] = [];

  // Weekly bars
  weeklyBars: WeeklyBar[] = [];
  weeklyTotal = 0;

  constructor(
    private readonly authService: AuthService,
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
  ) {}

  private refreshId: any;

  ngOnInit(): void {
    this.loadProviderName();
    this.buildAreaChart();
    this.buildDonutSegments();
    this.buildWeeklyBars();
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboard();
      this.refreshId = setInterval(() => this.loadDashboard(), 30000);
    }
  }

  private loadDashboard(): void {
    forkJoin({
      stats:   this.http.get<any>(`${environment.apiUrl}/api/analytics/provider/dashboard`),
      recent:  this.http.get<any>(`${environment.apiUrl}/api/authorizations/my?size=5&page=0`)
    }).pipe(finalize(() => this.cdr.detectChanges()))
      .subscribe({
        next: ({ stats, recent }) => {
          const d = stats?.data;
          if (d) {
            const submitted   = d.submittedCount     ?? 0;
            const underReview = d.underReviewCount   ?? 0;
            const approved    = d.approvedCount      ?? 0;
            const rejected    = d.rejectedCount      ?? 0;
            const total       = approved + rejected  || 1;

            this.pendingCount      = submitted + underReview;
            this.approvalRate      = Math.round(approved / total * 100);

            this.kpiCards[0].value = submitted;
            this.kpiCards[1].value = this.pendingCount;
            this.kpiCards[2].value = approved;

            const pending2   = submitted + underReview;
            const total2     = approved + rejected + pending2 || 1;
            this.updateDonut(approved, rejected, pending2, total2);

            // Populate monthly area chart from API trend data
            if (d.monthlyTrend?.length) {
              const trendMap: Record<string, number> = {};
              for (const row of d.monthlyTrend) {
                const id = row._id ?? row;
                if (id?.year != null && id?.month != null) {
                  const key = `${id.year}-${String(id.month).padStart(2, '0')}`;
                  trendMap[key] = row.count || 0;
                }
              }
              this.monthLabels = this.buildMonthLabels();
              const now = new Date();
              this.activityData = Array.from({ length: 12 }, (_, i) => {
                const dt = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
                const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
                return trendMap[key] || 0;
              });
              this.buildAreaChart();
            }
          }

          const list: any[] = (() => {
            const raw = recent?.data ?? recent;
            return Array.isArray(raw) ? raw : (raw?.content ?? []);
          })();

          this.recentRequests = list.map((a: any) => this.mapRecent(a));

          const scores = list.map((a: any) => a.aiScore).filter((s: any) => typeof s === 'number' && s > 0);
          this.kpiCards[3].value = scores.length
            ? Math.round(scores.reduce((acc: number, s: number) => acc + s, 0) / scores.length) + '%'
            : '--';
        },
        error: () => {}
      });
  }

  private mapRecent(a: any): RecentRequest {
    const statusMap: Record<string, RecentRequest['status']> = {
      APPROVED: 'approved', REJECTED: 'denied', SUBMITTED: 'pending',
      UNDER_REVIEW: 'in-review', DRAFT: 'pending', MORE_INFO_REQUESTED: 'in-review'
    };
    return {
      id:          a.referenceNumber ?? a.id ?? '',
      procedure:   a.procedureDescription ?? a.procedureCode ?? '--',
      patientName: a.patientName ?? 'Patient',
      maskedDob:   a.patientDateOfBirth ? '****' : '--',
      aiScore:     a.aiScore ?? 0,
      status:      statusMap[a.status] ?? 'pending',
      waitTime:    this.calcWait(a.submittedAt ?? a.createdAt),
    };
  }

  private calcWait(ts: string | null): string {
    if (!ts) return '--';
    const diff = Date.now() - new Date(ts).getTime();
    const hrs  = Math.floor(diff / 3600000);
    if (hrs < 1)  return '< 1h';
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  }

  private updateDonut(approved: number, rejected: number, pending: number, total: number): void {
    const pcts = [
      Math.round(approved / total * 100),
      Math.round(rejected / total * 100),
      Math.round(pending  / total * 100),
    ];
    let cum = 0;
    this.donutSegments = this.donutSegments.map((seg, i) => {
      const pct  = pcts[i] ?? 0;
      const dash   = (pct / 100) * this.donutCircumference;
      const gap    = this.donutCircumference - dash;
      const offset = -(cum / 100) * this.donutCircumference;
      cum += pct;
      return {
        ...seg,
        percent:    pct,
        count:      i === 0 ? approved : i === 1 ? rejected : pending,
        dashArray:  `${dash.toFixed(2)} ${gap.toFixed(2)}`,
        dashOffset: offset.toFixed(2),
      };
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.refreshId) { clearInterval(this.refreshId); }
  }

  // ---------------------------------------------------------------
  // Computed getters
  // ---------------------------------------------------------------

  get timeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  // ---------------------------------------------------------------
  // Private builders
  // ---------------------------------------------------------------

  private loadProviderName(): void {
    try {
      const user = this.authService.getCurrentUser();
      if (user) {
        const u = user as unknown as Record<string, unknown>;
        if (typeof u['lastName'] === 'string' && u['lastName']) {
          this.providerName = u['lastName'];
        } else if (typeof u['firstName'] === 'string' && u['firstName']) {
          this.providerName = u['firstName'] as string;
        } else if (typeof u['name'] === 'string' && u['name']) {
          const parts = (u['name'] as string).trim().split(' ');
          this.providerName = parts[parts.length - 1] || '';
        }
      }
    } catch {
      // leave empty — template shows "Good morning, Dr. " gracefully
    }
    this.cdr.markForCheck();
  }

  private buildMonthLabels(): string[] {
    const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return names[d.getMonth()];
    });
  }

  /**
   * Builds SVG area chart points, paths, grid lines and y-axis labels
   * for a 540x160 viewBox with padding: left=44, right=14, top=16, bottom=28.
   */
  private buildAreaChart(): void {
    const padL = 44, padR = 14, padT = 16, padB = 28;
    const w = 540, h = 160;
    const drawW = w - padL - padR;
    const drawH = h - padT - padB;

    const data = this.activityData;
    const maxVal = Math.max(0, ...data);
    const { ticks, niceMax } = this.computeNiceYTicks(maxVal);
    const range = niceMax;
    const xStep = drawW / (data.length - 1);

    this.areaPoints = data.map((val, i) => ({
      x: padL + i * xStep,
      y: padT + drawH - (val / range) * drawH,
    }));

    this.areaLinePath = this.buildSmoothPath(this.areaPoints);

    const last = this.areaPoints[this.areaPoints.length - 1];
    const first = this.areaPoints[0];
    const bottomY = padT + drawH;
    this.areaFillPath =
      this.buildSmoothPath(this.areaPoints) +
      ` L ${last.x},${bottomY} L ${first.x},${bottomY} Z`;

    const steps = ticks.length - 1;
    this.areaGridLines = ticks.map((_, i) => padT + (drawH / steps) * i);
    this.areaYLabels = ticks.map((tickVal, i) => ({
      y: padT + (drawH / steps) * i,
      label: String(tickVal),
    }));
  }

  private computeNiceYTicks(maxVal: number): { ticks: number[]; niceMax: number } {
    if (maxVal <= 0) return { ticks: [1, 0], niceMax: 1 };
    if (maxVal <= 4) {
      const ticks = Array.from({ length: maxVal + 1 }, (_, i) => maxVal - i);
      return { ticks, niceMax: maxVal };
    }
    const rawStep = maxVal / 4;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const nicedStep = Math.ceil(rawStep / magnitude) * magnitude;
    const niceMax = nicedStep * 4;
    const ticks = Array.from({ length: 5 }, (_, i) => niceMax - i * nicedStep);
    return { ticks, niceMax };
  }

  /**
   * Builds a smooth SVG cubic bezier path through an array of {x,y} points.
   */
  buildSmoothPath(points: AreaPoint[]): string {
    if (points.length < 2) return '';
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      path += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
    }
    return path;
  }

  private buildDonutSegments(): void {
    const raw = [
      { label: 'Approved', percent: 0, count: 0, color: '#10b981' },
      { label: 'Denied',   percent: 0, count: 0, color: '#ef4444' },
      { label: 'Pending',  percent: 0, count: 0, color: '#f59e0b' },
    ];

    let cum = 0;
    this.donutSegments = raw.map((seg) => {
      const dash = (seg.percent / 100) * this.donutCircumference;
      const gap  = this.donutCircumference - dash;
      const offset = -(cum / 100) * this.donutCircumference;
      cum += seg.percent;
      return {
        ...seg,
        dashArray: `${dash.toFixed(2)} ${gap.toFixed(2)}`,
        dashOffset: offset.toFixed(2),
      };
    });
  }

  private buildWeeklyBars(): void {
    const raw = [
      { day: 'Mon', count: 0 },
      { day: 'Tue', count: 0 },
      { day: 'Wed', count: 0 },
      { day: 'Thu', count: 0 },
      { day: 'Fri', count: 0 },
      { day: 'Sat', count: 0 },
      { day: 'Sun', count: 0 },
    ];
    this.weeklyTotal = 0;
    this.weeklyBars = raw.map((d) => ({ ...d, heightPx: 4 }));
  }

  // ---------------------------------------------------------------
  // Style helpers
  // ---------------------------------------------------------------

  getScoreBarClass(score: number): string {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-400';
    return 'bg-red-500';
  }

  getScoreTextClass(score: number): string {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      approved:  'bg-emerald-100 text-emerald-700',
      pending:   'bg-amber-100 text-amber-700',
      denied:    'bg-red-100 text-red-700',
      'in-review': 'bg-blue-100 text-blue-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      approved:    'Approved',
      pending:     'Pending',
      denied:      'Denied',
      'in-review': 'In Review',
    };
    return map[status] ?? status;
  }

  getWeeklyBarColorClass(count: number): string {
    if (count >= 5) return 'bg-blue-500';
    if (count >= 3) return 'bg-blue-400';
    return 'bg-blue-200';
  }

  // ---------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------

  onNewAuthRequest(): void {
    this.router.navigate(['/provider/authorizations']);
  }

  onViewRequest(id: string): void {
    this.router.navigate(['/provider/authorizations']);
  }
}
