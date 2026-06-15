import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LayoutModule } from '../../../shared/components/layout/layout.module';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';
import { environment } from '../../../../environments/environment';

interface KpiCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
}

interface RecentRequest {
  id: string;
  patient: string;
  procedure: string;
  provider: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'AI Review';
  aiScore: number;
}

interface DonutSegment {
  label: string;
  value: number;
  color: string;
  offset: number;
  dash: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutModule],
  template: `
    <div class="flex h-screen overflow-hidden bg-gray-50">

      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- OLD_SIDEBAR_REMOVED
          <a routerLink="/admin/dashboard"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Dashboard
          </a>
          <a routerLink="/admin/authorizations"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Authorizations
          </a>
          <a routerLink="/admin/patients"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Patients
          </a>
          <a routerLink="/admin/providers"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Providers
          </a>
          <a routerLink="/admin/ai-insights"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            AI Insights
          </a>
          <a routerLink="/admin/reports"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Reports
          </a>
          <a routerLink="/admin/settings"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Settings
          </a>
        </nav>
        <div class="p-4 border-t border-gray-100">
          <div class="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
              {{ currentUser?.firstName?.charAt(0) || 'A' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</p>
              <p class="text-xs text-gray-500 truncate">Administrator</p>
            </div>
          </div>
        </div>
      OLD_SIDEBAR_REMOVED -->

      <!-- Right column: header + scrollable main -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <app-header></app-header>

        <!-- Scrollable main content -->
        <main class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          <!-- HERO BANNER -->
          <div class="rounded-2xl p-5 md:p-8 relative overflow-hidden"
               style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #0ea5e9 100%);">
            <div class="absolute -top-10 -right-10 w-64 h-64 rounded-full"
                 style="background: rgba(255,255,255,0.08);"></div>
            <div class="absolute -bottom-16 -left-8 w-48 h-48 rounded-full"
                 style="background: rgba(255,255,255,0.06);"></div>
            <div class="relative z-10">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                   style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.25);">
                <span class="w-1.5 h-1.5 rounded-full bg-green-400 live-dot"></span>
                Live &nbsp;&middot;&nbsp; last sync {{ syncSec }}s ago
              </div>
              <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
                Good {{ timeOfDay }}, {{ currentUser?.firstName || 'Admin' }}
              </h1>
              <p class="text-sm md:text-base max-w-lg" style="color: rgba(224,231,255,0.9);">
                Welcome to the HealthConnector admin dashboard. Manage providers, payers, and authorization requests.
              </p>
            </div>
          </div>

          <!-- KPI CARDS -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (card of kpiCards; track card.label) {
            <div class="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between mb-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                     [style.background]="card.iconBg" [style.color]="card.iconColor">
                  {{ card.icon }}
                </div>
                <span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                      [ngClass]="card.positive ? 'badge-green' : 'badge-red'">
                  {{ card.positive ? '&#x2191;' : '&#x2193;' }} {{ card.change }}
                </span>
              </div>
              <p class="text-2xl font-bold text-gray-900 mb-0.5">{{ card.value }}</p>
              <p class="text-sm text-gray-500">{{ card.label }}</p>
              <p class="text-xs text-gray-400 mt-1">vs last month</p>
            </div>
            }
          </div>

          <!-- CHARTS ROW -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <!-- SVG Area Chart -->
            <div class="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-base font-semibold text-gray-900">Request Volume</h3>
                  <p class="text-sm text-gray-500">Monthly trend &mdash; current year</p>
                </div>
                <div class="flex items-center gap-4 text-xs">
                  <span class="flex items-center gap-1.5">
                    <span class="w-3 h-3 rounded-sm" style="background:#6366f1;"></span>
                    <span class="text-gray-600">Requests</span>
                  </span>
                  <span class="flex items-center gap-1.5">
                    <span class="w-3 h-3 rounded-sm" style="background:#10b981;"></span>
                    <span class="text-gray-600">Approved</span>
                  </span>
                </div>
              </div>
              <svg viewBox="0 0 600 180" class="w-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="gradRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#6366f1" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#6366f1" stop-opacity="0.02"/>
                  </linearGradient>
                  <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#10b981" stop-opacity="0.02"/>
                  </linearGradient>
                </defs>
                <!-- Y-axis grid lines -->
                <line x1="44" y1="10"  x2="590" y2="10"  stroke="#f3f4f6" stroke-width="1"/>
                <line x1="44" y1="43"  x2="590" y2="43"  stroke="#f3f4f6" stroke-width="1"/>
                <line x1="44" y1="76"  x2="590" y2="76"  stroke="#f3f4f6" stroke-width="1"/>
                <line x1="44" y1="109" x2="590" y2="109" stroke="#f3f4f6" stroke-width="1"/>
                <line x1="44" y1="142" x2="590" y2="142" stroke="#f3f4f6" stroke-width="1"/>
                <!-- Y-axis value labels (dynamic) -->
                <text x="38" y="14"  text-anchor="end" font-size="9" fill="#9ca3af">{{ chartMax }}</text>
                <text x="38" y="47"  text-anchor="end" font-size="9" fill="#9ca3af">{{ chartMax75 }}</text>
                <text x="38" y="80"  text-anchor="end" font-size="9" fill="#9ca3af">{{ chartMax50 }}</text>
                <text x="38" y="113" text-anchor="end" font-size="9" fill="#9ca3af">{{ chartMax25 }}</text>
                <text x="38" y="146" text-anchor="end" font-size="9" fill="#9ca3af">0</text>
                <!-- Requests area fill -->
                <path [attr.d]="areaPath(requestsData, 546, 132)" transform="translate(44,10)"
                      fill="url(#gradRequests)"/>
                <!-- Approved area fill -->
                <path [attr.d]="areaPath(approvedData, 546, 132)" transform="translate(44,10)"
                      fill="url(#gradApproved)"/>
                <!-- Requests line -->
                <path [attr.d]="linePath(requestsData, 546, 132)" transform="translate(44,10)"
                      fill="none" stroke="#6366f1" stroke-width="2"
                      stroke-linejoin="round" stroke-linecap="round"/>
                <!-- Approved line -->
                <path [attr.d]="linePath(approvedData, 546, 132)" transform="translate(44,10)"
                      fill="none" stroke="#10b981" stroke-width="2"
                      stroke-linejoin="round" stroke-linecap="round"/>
                <!-- X-axis month labels -->
                <text x="44"  y="168" text-anchor="middle" font-size="9" fill="#9ca3af">Jan</text>
                <text x="94"  y="168" text-anchor="middle" font-size="9" fill="#9ca3af">Feb</text>
                <text x="144" y="168" text-anchor="middle" font-size="9" fill="#9ca3af">Mar</text>
                <text x="194" y="168" text-anchor="middle" font-size="9" fill="#9ca3af">Apr</text>
                <text x="244" y="168" text-anchor="middle" font-size="9" fill="#9ca3af">May</text>
                <text x="294" y="168" text-anchor="middle" font-size="9" fill="#9ca3af">Jun</text>
                <text x="344" y="168" text-anchor="middle" font-size="9" fill="#9ca3af">Jul</text>
                <text x="394" y="168" text-anchor="middle" font-size="9" fill="#9ca3af">Aug</text>
                <text x="444" y="168" text-anchor="middle" font-size="9" fill="#9ca3af">Sep</text>
                <text x="494" y="168" text-anchor="middle" font-size="9" fill="#9ca3af">Oct</text>
                <text x="544" y="168" text-anchor="middle" font-size="9" fill="#9ca3af">Nov</text>
                <text x="590" y="168" text-anchor="middle" font-size="9" fill="#9ca3af">Dec</text>
              </svg>
            </div>

            <!-- SVG Donut Chart -->
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div class="mb-4">
                <h3 class="text-base font-semibold text-gray-900">Status Breakdown</h3>
                <p class="text-sm text-gray-500">Authorization status overview</p>
              </div>
              <div class="flex flex-col items-center">
                <svg viewBox="0 0 160 160" class="w-36 h-36">
                  <circle cx="80" cy="80" r="54" fill="none" stroke="#f3f4f6" stroke-width="22"/>
                  @for (seg of donutSegments; track seg.label) {
                  <circle
                    cx="80" cy="80" r="54"
                    fill="none"
                    [attr.stroke]="seg.color"
                    stroke-width="22"
                    [attr.stroke-dasharray]="seg.dash + ' ' + (339.3 - seg.dash)"
                    [attr.stroke-dashoffset]="seg.offset"
                    transform="rotate(-90 80 80)"
                    stroke-linecap="butt"/>
                  }
                  <text x="80" y="77" text-anchor="middle" font-size="16" font-weight="700" fill="#111827">{{ totalRequests }}</text>
                  <text x="80" y="92" text-anchor="middle" font-size="8" fill="#6b7280">Total</text>
                </svg>
                <div class="w-full mt-4 space-y-2">
                  @for (seg of donutSegments; track seg.label) {
                  <div class="flex items-center justify-between text-sm">
                    <span class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full" [style.background]="seg.color"></span>
                      <span class="text-gray-600">{{ seg.label }}</span>
                    </span>
                    <span class="font-semibold text-gray-900">{{ seg.value.toLocaleString() }}</span>
                  </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- LIVE PIPELINE -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div class="flex items-center gap-2 mb-4">
              <span class="w-2 h-2 rounded-full bg-green-500 live-dot"></span>
              <h3 class="text-base font-semibold text-gray-900">Live Pipeline</h3>
              <span class="text-xs text-gray-400 ml-auto">Updates every 8s</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="text-center p-3 rounded-xl" style="background:#eff6ff; border:1px solid #bfdbfe;">
                <p class="text-2xl font-bold" style="color:#1d4ed8;">{{ livePipeline.submitted }}</p>
                <p class="text-xs font-medium mt-0.5" style="color:#2563eb;">Submitted</p>
              </div>
              <div class="text-center p-3 rounded-xl" style="background:#fffbeb; border:1px solid #fde68a;">
                <p class="text-2xl font-bold" style="color:#b45309;">{{ livePipeline.inReview }}</p>
                <p class="text-xs font-medium mt-0.5" style="color:#d97706;">In Review</p>
              </div>
              <div class="text-center p-3 rounded-xl" style="background:#ecfdf5; border:1px solid #a7f3d0;">
                <p class="text-2xl font-bold" style="color:#065f46;">{{ livePipeline.approvedToday }}</p>
                <p class="text-xs font-medium mt-0.5" style="color:#059669;">Total Approved</p>
              </div>
              <div class="text-center p-3 rounded-xl" style="background:#fef2f2; border:1px solid #fecaca;">
                <p class="text-2xl font-bold" style="color:#991b1b;">{{ livePipeline.deniedToday }}</p>
                <p class="text-xs font-medium mt-0.5" style="color:#dc2626;">Total Rejected</p>
              </div>
            </div>
          </div>

          <!-- RECENT REQUESTS TABLE -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 class="text-base font-semibold text-gray-900">Recent Requests</h3>
                <p class="text-sm text-gray-500">Latest authorization activity</p>
              </div>
              <button class="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                View all &rarr;
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-gray-50 text-left">
                    <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                    <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Procedure</th>
                    <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                    <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Score</th>
                    <th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (req of recentRequests; track req.id) {
                  <tr class="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 text-sm font-mono font-medium text-indigo-600">{{ req.id }}</td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2.5">
                        <div class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                          {{ req.patient.charAt(0) }}
                        </div>
                        <span class="text-sm font-medium text-gray-900">{{ req.patient }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-600">{{ req.procedure }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">{{ req.provider }}</td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                            [ngClass]="{
                              'status-approved': req.status === 'Approved',
                              'status-pending':  req.status === 'Pending',
                              'status-rejected': req.status === 'Rejected',
                              'status-ai':       req.status === 'AI Review'
                            }">
                        {{ req.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <div class="flex-1 h-1.5 rounded-full overflow-hidden score-track" style="min-width:60px;">
                          <div class="h-full rounded-full transition-all"
                               [style.width.%]="req.aiScore"
                               [ngClass]="{
                                 'score-high': req.aiScore >= 75,
                                 'score-mid':  req.aiScore >= 50 && req.aiScore < 75,
                                 'score-low':  req.aiScore < 50
                               }"></div>
                        </div>
                        <span class="text-xs font-medium text-gray-600 w-8 text-right">{{ req.aiScore }}%</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-1">
                        <button class="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors" title="View">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  }
                  @if (recentRequests.length === 0) {
                  <tr>
                    <td colspan="7" class="px-6 py-10 text-center text-sm text-gray-400">
                      No authorization requests yet
                    </td>
                  </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
    .live-dot { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }

    .hero-btn-ghost {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      backdrop-filter: blur(4px);
    }
    .hero-btn-ghost:hover { background: rgba(255,255,255,0.28); transform: scale(1.03); }
    .hero-btn-solid:hover { transform: scale(1.03); }

    .badge-green { background: #ecfdf5; color: #065f46; }
    .badge-red   { background: #fef2f2; color: #991b1b; }

    .status-approved { background: #d1fae5; color: #065f46; }
    .status-pending  { background: #fef3c7; color: #92400e; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .status-ai       { background: #dbeafe; color: #1e40af; }

    .score-track { background: #f3f4f6; }
    .score-high  { background: #10b981; }
    .score-mid   { background: #f59e0b; }
    .score-low   { background: #ef4444; }
  `],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  timeOfDay: 'morning' | 'afternoon' | 'evening' = 'morning';
  syncSec: number = 0;

  private syncTickId: ReturnType<typeof setInterval> | null = null;

  totalRequests = 0;

  requestsData: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  approvedData: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  get chartMax():   number { return Math.max(...this.requestsData, 4); }
  get chartMax75(): number { return Math.round(this.chartMax * 0.75); }
  get chartMax50(): number { return Math.round(this.chartMax * 0.5); }
  get chartMax25(): number { return Math.round(this.chartMax * 0.25); }

  kpiCards: KpiCard[] = [
    { label: 'Total Requests', value: '0', change: '--', positive: true,  icon: '📋', iconBg: '#eef2ff', iconColor: '#4f46e5' },
    { label: 'Pending',        value: '0', change: '--', positive: true,  icon: '⏳', iconBg: '#fffbeb', iconColor: '#d97706' },
    { label: 'Approved',       value: '0', change: '--', positive: true,  icon: '✅', iconBg: '#ecfdf5', iconColor: '#059669' },
    { label: 'AI Reviewed',    value: '0', change: '--', positive: true,  icon: '🤖', iconBg: '#eff6ff', iconColor: '#2563eb' },
  ];

  donutSegments: DonutSegment[] = [];

  recentRequests: RecentRequest[] = [];

  livePipeline = {
    submitted:     0,
    inReview:      0,
    approvedToday: 0,
    deniedToday:   0,
  };

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  private refreshId: any;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.setTimeOfDay();
    this.buildDonutSegments();

    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboard();
      this.refreshId = setInterval(() => this.loadDashboard(), 30000);
    }

    this.syncTickId = setInterval(() => {
      this.ngZone.run(() => {
        this.syncSec += 1;
        this.cdr.markForCheck();
      });
    }, 1000);
  }

  private loadDashboard(): void {
    this.http.get<any>(`${environment.apiUrl}/api/analytics/admin/dashboard`).subscribe({
      next: (res) => {
        const d = res?.data;
        if (!d) return;
        this.kpiCards = [
          { label: 'Total Requests', value: String(d.totalRequests ?? 0),  change: '--', positive: true, icon: '📋', iconBg: '#eef2ff', iconColor: '#4f46e5' },
          { label: 'Pending',        value: String(d.pendingRequests ?? 0), change: '--', positive: true, icon: '⏳', iconBg: '#fffbeb', iconColor: '#d97706' },
          { label: 'Approved',       value: String(d.approvedRequests ?? 0),change: '--', positive: true, icon: '✅', iconBg: '#ecfdf5', iconColor: '#059669' },
          { label: 'AI Reviewed',    value: String(d.aiUsageCount ?? 0),    change: '--', positive: true, icon: '🤖', iconBg: '#eff6ff', iconColor: '#2563eb' },
        ];
        this.livePipeline = {
          submitted:     (d.pendingRequests ?? 0) - (d.underReviewRequests ?? 0),
          inReview:      d.underReviewRequests ?? 0,
          approvedToday: d.approvedRequests ?? 0,
          deniedToday:   d.rejectedRequests ?? 0,
        };
        this.buildDonutSegmentsFromData(d);

        // Populate monthly chart from trend data (Jan-Dec of current year)
        if (d.monthlyRequestTrend?.length) {
          const trendMap: Record<string, number> = {};
          for (const row of d.monthlyRequestTrend) {
            const id = row['_id'] ?? row;
            if (id?.year != null && id?.month != null) {
              const key = `${id.year}-${String(id.month).padStart(2, '0')}`;
              trendMap[key] = row['count'] || 0;
            }
          }
          const year = new Date().getFullYear();
          this.requestsData = Array.from({ length: 12 }, (_, i) => {
            const key = `${year}-${String(i + 1).padStart(2, '0')}`;
            return trendMap[key] || 0;
          });
          this.approvedData = this.requestsData.map(v =>
            d.totalRequests > 0 ? Math.round(v * (d.approvedRequests / d.totalRequests)) : 0
          );
        }

        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  private buildDonutSegmentsFromData(d: any): void {
    const circumference = 2 * Math.PI * 54;
    const raw = [
      { label: 'Approved',  value: d.approvedRequests ?? 0, color: '#10b981' },
      { label: 'Pending',   value: d.pendingRequests  ?? 0, color: '#f59e0b' },
      { label: 'Rejected',  value: d.rejectedRequests ?? 0, color: '#ef4444' },
      { label: 'Draft',     value: d.draftRequests    ?? 0, color: '#3b82f6' },
    ];
    this.totalRequests = d.totalRequests ?? 0;
    const divisor = raw.reduce((s, r) => s + r.value, 0) || 1;
    let cumulative = 0;
    this.donutSegments = raw.map((seg) => {
      const dash   = (seg.value / divisor) * circumference;
      const offset = circumference - (cumulative / divisor) * circumference;
      cumulative  += seg.value;
      return { ...seg, dash, offset };
    });
  }

  ngOnDestroy(): void {
    if (this.syncTickId !== null) { clearInterval(this.syncTickId); this.syncTickId = null; }
    if (this.refreshId)           { clearInterval(this.refreshId); this.refreshId = null; }
  }

  // -----------------------------------------------------------------------
  // SVG path helpers
  // -----------------------------------------------------------------------

  /** Generate an SVG polyline path string for the given data array. */
  linePath(data: number[], w: number, h: number): string {
    const max   = Math.max(...data);
    const min   = 0;
    const range = max - min || 1;
    const step  = w / (data.length - 1);
    return data
      .map((v, i) => {
        const x = i * step;
        const y = h - ((v - min) / range) * h;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
  }

  /** Generate a closed SVG area path (line + bottom baseline). */
  areaPath(data: number[], w: number, h: number): string {
    const line  = this.linePath(data, w, h);
    const lastX = w.toFixed(2);
    return `${line} L ${lastX} ${h.toFixed(2)} L 0.00 ${h.toFixed(2)} Z`;
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private setTimeOfDay(): void {
    const hour = new Date().getHours();
    if (hour < 12)      { this.timeOfDay = 'morning';   }
    else if (hour < 17) { this.timeOfDay = 'afternoon'; }
    else                { this.timeOfDay = 'evening';   }
  }

  private buildDonutSegments(): void {
    const circumference = 2 * Math.PI * 54;
    const raw: Array<{ label: string; value: number; color: string }> = [
      { label: 'Approved',  value: 0, color: '#10b981' },
      { label: 'Pending',   value: 0, color: '#f59e0b' },
      { label: 'Rejected',  value: 0, color: '#ef4444' },
      { label: 'AI Review', value: 0, color: '#3b82f6' },
    ];
    const total = raw.reduce((s, d) => s + d.value, 0) || 1;
    let cumulative = 0;
    this.totalRequests = 0;
    this.donutSegments = raw.map((d) => {
      const dash   = (d.value / total) * circumference;
      const offset = circumference - (cumulative / total) * circumference;
      cumulative  += d.value;
      return { ...d, dash, offset };
    });
  }
}
