import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/layout/header/header.component';
import { SidebarComponent } from '../../../shared/components/layout/sidebar/sidebar.component';
import { environment } from '../../../../environments/environment';

interface ReviewItem {
  id: string;
  referenceNumber: string;
  patientName: string;
  patientDOB: string;
  procedureCode: string;
  procedureName: string;
  diagnosisCode: string;
  providerName: string;
  providerOrg: string;
  submittedAt: string;
  aiScore: number | null;
  aiRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  aiRecommendation: string;
  aiWarnings: string[];
  aiSuggestions: string[];
  clinicalNotes: string;
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENT';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'MORE_INFO_REQUIRED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  payerNotes: string;
  rejectionReason: string;
  moreInfoNotes: string;
}

interface ReviewChatMsg {
  id: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-50">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col min-w-0">
        <app-header></app-header>
        <main class="flex-1 overflow-y-auto px-4 md:px-6 py-6">
          <div class="max-w-7xl mx-auto">

            <!-- Header -->
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Authorization Review Queue</h1>
                <p class="text-gray-500 text-sm mt-0.5">Review, update status, and make decisions on prior authorization requests</p>
              </div>
              <button (click)="loadQueue()" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                Refresh
              </button>
            </div>

            <!-- Stats Row -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <p class="text-xs text-gray-500 font-medium">Submitted</p>
                <p class="text-2xl font-bold text-blue-600 mt-1">{{ countByStatus('SUBMITTED') }}</p>
              </div>
              <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <p class="text-xs text-gray-500 font-medium">Under Review</p>
                <p class="text-2xl font-bold text-yellow-600 mt-1">{{ countByStatus('UNDER_REVIEW') }}</p>
              </div>
              <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <p class="text-xs text-gray-500 font-medium">More Info</p>
                <p class="text-2xl font-bold text-orange-600 mt-1">{{ countByStatus('MORE_INFO_REQUIRED') }}</p>
              </div>
              <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <p class="text-xs text-gray-500 font-medium">Approved</p>
                <p class="text-2xl font-bold text-green-600 mt-1">{{ countByStatus('APPROVED') }}</p>
              </div>
              <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <p class="text-xs text-gray-500 font-medium">Rejected</p>
                <p class="text-2xl font-bold text-red-600 mt-1">{{ countByStatus('REJECTED') }}</p>
              </div>
            </div>

            <!-- Filter Bar -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-col sm:flex-row gap-3">
              <div class="flex-1 relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="text" [(ngModel)]="searchQuery" (input)="applyFilters()"
                       placeholder="Search patient, procedure or reference..."
                       class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              </div>
              <select [(ngModel)]="statusFilter" (change)="applyFilters()"
                      class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="MORE_INFO_REQUIRED">More Info</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select [(ngModel)]="riskFilter" (change)="applyFilters()"
                      class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
              </select>
            </div>

            <!-- Loading -->
            @if (loading) {
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 text-sm">
              Loading queue...
            </div>
            }

            <!-- Queue Table -->
            @if (!loading) {
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50 border-b border-gray-100">
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700">Reference</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700">Patient & Procedure</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700 hidden md:table-cell">Provider</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700 hidden lg:table-cell">AI Score</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700">Status</th>
                      <th class="text-right px-5 py-3.5 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    @for (item of filteredItems; track item.id) {
                    <tr class="hover:bg-gray-50 transition">
                      <td class="px-5 py-4">
                        <p class="font-mono text-xs text-blue-700 font-semibold">{{ item.referenceNumber }}</p>
                        <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(item.submittedAt) }}</p>
                        @if (item.priority !== 'ROUTINE') {
                        <span class="inline-block mt-1 px-1.5 py-0.5 text-xs rounded font-medium"
                              [ngClass]="item.priority === 'EMERGENT' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'">
                          {{ item.priority }}
                        </span>
                        }
                      </td>
                      <td class="px-5 py-4">
                        <p class="font-medium text-gray-900">{{ item.patientName }}</p>
                        <p class="text-xs text-gray-500">{{ item.procedureName }}</p>
                        <p class="text-xs font-mono text-gray-400 mt-0.5">{{ item.procedureCode }} / {{ item.diagnosisCode }}</p>
                      </td>
                      <td class="px-5 py-4 hidden md:table-cell">
                        <p class="text-gray-900 text-xs font-medium">{{ item.providerName }}</p>
                        <p class="text-xs text-gray-500">{{ item.providerOrg }}</p>
                      </td>
                      <td class="px-5 py-4 hidden lg:table-cell">
                        @if (item.aiScore !== null) {
                        <div class="flex items-center gap-2 mb-1">
                          <div class="flex-1 h-1.5 bg-gray-100 rounded-full max-w-20">
                            <div class="h-1.5 rounded-full" [style.width]="item.aiScore + '%'" [ngClass]="getAiBarClass(item.aiScore)"></div>
                          </div>
                          <span class="text-xs font-semibold" [ngClass]="getAiScoreClass(item.aiScore)">{{ item.aiScore }}</span>
                        </div>
                        <span class="px-2 py-0.5 text-xs rounded-full font-medium" [ngClass]="getRiskClass(item.aiRiskLevel)">
                          {{ item.aiRiskLevel }} Risk
                        </span>
                        } @else {
                        <span class="text-xs text-gray-400">No AI scan</span>
                        }
                      </td>
                      <td class="px-5 py-4">
                        <span class="px-2.5 py-1 text-xs font-semibold rounded-full" [ngClass]="getStatusClass(item.status)">
                          {{ statusLabel(item.status) }}
                        </span>
                      </td>
                      <td class="px-5 py-4">
                        <div class="flex items-center justify-end gap-1.5 flex-wrap">
                          <button (click)="openDetail(item)"
                                  class="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                            Review
                          </button>
                          @if (item.status === 'SUBMITTED') {
                          <button (click)="doStartReview(item)"
                                  class="px-2.5 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                            Start Review
                          </button>
                          }
                          @if (item.status === 'SUBMITTED' || item.status === 'UNDER_REVIEW' || item.status === 'MORE_INFO_REQUIRED') {
                          <button (click)="doQuickApprove(item)"
                                  class="px-2.5 py-1 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition">
                            Approve
                          </button>
                          <button (click)="openModal(item, 'REJECT')"
                                  class="px-2.5 py-1 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
                            Reject
                          </button>
                          }
                          @if (item.status === 'APPROVED' || item.status === 'REJECTED') {
                          <button (click)="doReconsider(item)"
                                  class="px-2.5 py-1 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition">
                            Reconsider
                          </button>
                          }
                        </div>
                      </td>
                    </tr>
                    }
                    @if (filteredItems.length === 0) {
                    <tr>
                      <td colspan="6" class="px-5 py-12 text-center text-gray-400 text-sm">No requests match your filters</td>
                    </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
            }
          </div>
        </main>
      </div>
    </div>

    <!-- Detail Modal -->
    @if (detailItem) {
    <div class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto" style="background:rgba(0,0,0,0.55)">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mb-8">

        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ detailItem.referenceNumber }}</h3>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full" [ngClass]="getStatusClass(detailItem.status)">
                {{ statusLabel(detailItem.status) }}
              </span>
              @if (detailItem.priority !== 'ROUTINE') {
              <span class="px-2 py-0.5 text-xs rounded-full font-medium"
                    [ngClass]="detailItem.priority === 'EMERGENT' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'">
                {{ detailItem.priority }}
              </span>
              }
            </div>
          </div>
          <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 transition ml-4 shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="px-6 py-5 space-y-5">

          <!-- Patient & Clinical -->
          <div>
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Patient & Clinical</p>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-400">Patient</p><p class="font-medium text-gray-900 text-sm">{{ detailItem.patientName }}</p></div>
              <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-400">Date of Birth</p><p class="font-medium text-gray-900 text-sm">{{ detailItem.patientDOB || '—' }}</p></div>
              <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-400">Procedure (CPT)</p><p class="font-medium text-gray-900 text-sm">{{ detailItem.procedureName }}</p><p class="font-mono text-xs text-gray-500">{{ detailItem.procedureCode }}</p></div>
              <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-400">Diagnosis (ICD-10)</p><p class="font-mono text-gray-900 text-sm">{{ detailItem.diagnosisCode }}</p></div>
            </div>
          </div>

          <!-- Provider -->
          <div>
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Provider</p>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="font-medium text-gray-900 text-sm">{{ detailItem.providerName }}</p>
              <p class="text-xs text-gray-500">{{ detailItem.providerOrg }}</p>
            </div>
          </div>

          <!-- Clinical Notes -->
          <div>
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Clinical Notes</p>
            <div class="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed min-h-12">
              {{ detailItem.clinicalNotes || 'No clinical notes provided.' }}
            </div>
          </div>

          <!-- Previous notes if any -->
          @if (detailItem.payerNotes || detailItem.rejectionReason || detailItem.moreInfoNotes) {
          <div>
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Previous Payer Notes</p>
            <div class="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800">
              {{ detailItem.payerNotes || detailItem.rejectionReason || detailItem.moreInfoNotes }}
            </div>
          </div>
          }

          <!-- Per-request chat with provider -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <div class="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
                <span class="text-sm font-semibold text-gray-700">Messages with Provider</span>
                @if (reviewChatLoading) {
                <svg class="w-3.5 h-3.5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                }
              </div>
              <button (click)="loadReviewChat(detailItem!.id)" class="text-xs text-gray-400 hover:text-blue-600">Refresh</button>
            </div>
            <div #reviewChatBox class="h-44 overflow-y-auto px-4 py-3 space-y-2 bg-white">
              @if (!reviewChatLoading && reviewChatMessages.length === 0) {
              <p class="text-xs text-gray-400 text-center py-6">No messages yet from the provider.</p>
              }
              @for (m of reviewChatMessages; track m.id) {
              <div class="flex" [class.justify-end]="m.isOwn">
                <div class="max-w-xs">
                  @if (!m.isOwn) {
                  <p class="text-xs text-gray-400 mb-0.5 ml-1">{{ m.senderName || 'Provider' }}</p>
                  }
                  <div class="px-3 py-2 rounded-xl text-sm"
                       [ngClass]="m.isOwn ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'">
                    {{ m.text }}
                  </div>
                  <p class="text-xs text-gray-400 mt-0.5" [class.text-right]="m.isOwn">{{ formatMsgTime(m.timestamp) }}</p>
                </div>
              </div>
              }
            </div>
            <div class="border-t border-gray-100 px-3 py-2.5 flex gap-2 bg-gray-50">
              <input [(ngModel)]="reviewChatMessage" (keydown.enter)="sendReviewChat()"
                     placeholder="Reply to provider..."
                     class="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <button (click)="sendReviewChat()" [disabled]="!reviewChatMessage.trim() || reviewChatSending"
                      class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition disabled:opacity-40">
                @if (reviewChatSending) { ... } @else { Send }
              </button>
            </div>
          </div>

          <!-- AI Copilot Panel -->
          <div class="rounded-xl border overflow-hidden"
               [ngClass]="detailItem.aiRiskLevel === 'LOW' ? 'border-green-200' : detailItem.aiRiskLevel === 'HIGH' ? 'border-red-200' : 'border-yellow-200'">

            <!-- AI Header -->
            <div class="flex items-center justify-between px-4 py-3"
                 [ngClass]="detailItem.aiRiskLevel === 'LOW' ? 'bg-green-50' : detailItem.aiRiskLevel === 'HIGH' ? 'bg-red-50' : detailItem.aiScore !== null ? 'bg-yellow-50' : 'bg-gray-50'">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                     style="background:linear-gradient(135deg,#7c3aed,#a855f7)">
                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                </div>
                <span class="text-sm font-semibold text-gray-700">AI Copilot Assessment</span>
              </div>
              <button (click)="runAI()" [disabled]="aiLoading"
                      class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition"
                      [ngClass]="aiLoading ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'">
                @if (aiLoading) {
                <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Analyzing...
                } @else {
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                {{ detailItem.aiScore !== null ? 'Re-run AI' : 'Run AI Analysis' }}
                }
              </button>
            </div>

            <!-- AI Body -->
            <div class="px-4 py-4 bg-white">
              @if (detailItem.aiScore !== null) {
              <!-- Score bar -->
              <div class="flex items-center gap-3 mb-3">
                <div class="flex-1 h-2.5 bg-gray-100 rounded-full">
                  <div class="h-2.5 rounded-full transition-all duration-500"
                       [style.width]="detailItem.aiScore + '%'"
                       [ngClass]="getAiBarClass(detailItem.aiScore)"></div>
                </div>
                <span class="font-bold text-lg w-14 text-right" [ngClass]="getAiScoreClass(detailItem.aiScore)">{{ detailItem.aiScore }}/100</span>
              </div>

              <!-- Risk + Recommendation badges -->
              <div class="flex items-center gap-2 flex-wrap mb-3">
                <span class="px-2.5 py-1 text-xs rounded-full font-semibold" [ngClass]="getRiskClass(detailItem.aiRiskLevel)">
                  {{ detailItem.aiRiskLevel }} Risk
                </span>
                <span class="px-2.5 py-1 text-xs rounded-full font-semibold" [ngClass]="getRecommendationClass(detailItem.aiRecommendation)">
                  AI: {{ detailItem.aiRecommendation || 'REVIEW' }}
                </span>
              </div>

              <!-- Warnings -->
              @if (detailItem.aiWarnings.length > 0) {
              <div class="mb-3">
                <p class="text-xs font-semibold text-red-600 mb-1.5">Warnings</p>
                <ul class="space-y-1">
                  @for (w of detailItem.aiWarnings; track w) {
                  <li class="flex items-start gap-2 text-xs text-red-700">
                    <svg class="w-3.5 h-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                    {{ w }}
                  </li>
                  }
                </ul>
              </div>
              }

              <!-- Suggestions -->
              @if (detailItem.aiSuggestions.length > 0) {
              <div>
                <p class="text-xs font-semibold text-blue-600 mb-1.5">Suggestions</p>
                <ul class="space-y-1">
                  @for (s of detailItem.aiSuggestions; track s) {
                  <li class="flex items-start gap-2 text-xs text-blue-700">
                    <svg class="w-3.5 h-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
                    {{ s }}
                  </li>
                  }
                </ul>
              </div>
              }
              } @else {
              <p class="text-sm text-gray-400 py-2 text-center">No AI analysis yet. Click "Run AI Analysis" to get an assessment.</p>
              }
            </div>
          </div>

          <!-- Decision / Status Change Section -->
          <div>
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Update Status</p>

            @if (!decisionMode) {
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">

              @if (detailItem.status === 'SUBMITTED') {
              <button (click)="doStartReview(detailItem!); closeModal()"
                      class="py-2.5 px-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm flex items-center justify-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                Start Review
              </button>
              }

              @if (detailItem.status === 'SUBMITTED' || detailItem.status === 'UNDER_REVIEW' || detailItem.status === 'MORE_INFO_REQUIRED') {
              <button (click)="decisionMode = 'APPROVE'"
                      class="py-2.5 px-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium text-sm flex items-center justify-center gap-1.5">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Approve
              </button>
              <button (click)="decisionMode = 'MORE_INFO'"
                      class="py-2.5 px-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition font-medium text-sm flex items-center justify-center gap-1.5">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                More Info
              </button>
              <button (click)="decisionMode = 'REJECT'"
                      class="py-2.5 px-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium text-sm flex items-center justify-center gap-1.5">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                Reject
              </button>
              }

              @if (detailItem.status === 'APPROVED' || detailItem.status === 'REJECTED') {
              <button (click)="doReconsider(detailItem!); closeModal()"
                      class="py-2.5 px-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium text-sm flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                Reconsider
              </button>
              <button (click)="decisionMode = (detailItem.status === 'APPROVED' ? 'REJECT' : 'APPROVE')"
                      class="py-2.5 px-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm">
                {{ detailItem.status === 'APPROVED' ? 'Override → Reject' : 'Override → Approve' }}
              </button>
              }

              @if (detailItem.status === 'COMPLETED') {
              <p class="col-span-3 text-sm text-gray-400 py-2 text-center">This request is completed. No further status changes available.</p>
              }
            </div>
            }

            <!-- Approve form -->
            @if (decisionMode === 'APPROVE') {
            <form [formGroup]="decisionForm" (ngSubmit)="submitDecision('APPROVE')">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Approval Notes (optional)</label>
              <textarea formControlName="notes" rows="3" placeholder="Add approval conditions or notes..."
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm resize-none mb-3"></textarea>
              <div class="flex gap-3">
                <button type="button" (click)="decisionMode = null" class="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm">Back</button>
                <button type="submit" class="flex-1 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-semibold text-sm">Confirm Approval</button>
              </div>
            </form>
            }

            <!-- More Info form -->
            @if (decisionMode === 'MORE_INFO') {
            <form [formGroup]="decisionForm" (ngSubmit)="submitDecision('MORE_INFO')">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Information Required *</label>
              <textarea formControlName="notes" rows="3" placeholder="Specify what additional information is needed..."
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none text-sm resize-none mb-3"></textarea>
              <div class="flex gap-3">
                <button type="button" (click)="decisionMode = null" class="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm">Back</button>
                <button type="submit" [disabled]="!decisionForm.get('notes')?.value?.trim()"
                        class="flex-1 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition font-semibold text-sm disabled:opacity-50">Send Request</button>
              </div>
            </form>
            }

            <!-- Reject form -->
            @if (decisionMode === 'REJECT') {
            <form [formGroup]="decisionForm" (ngSubmit)="submitDecision('REJECT')">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Denial Reason *</label>
              <select formControlName="denialReason" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 outline-none text-sm bg-white mb-3">
                <option value="">Select denial reason...</option>
                <option value="NOT_MEDICALLY_NECESSARY">Not Medically Necessary</option>
                <option value="INSUFFICIENT_DOCUMENTATION">Insufficient Documentation</option>
                <option value="NOT_COVERED">Service Not Covered</option>
                <option value="EXPERIMENTAL">Experimental / Investigational</option>
                <option value="ALTERNATIVE_TREATMENT">Alternative Treatment Available</option>
              </select>
              <textarea formControlName="notes" rows="2" placeholder="Additional notes..."
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 outline-none text-sm resize-none mb-3"></textarea>
              <div class="flex gap-3">
                <button type="button" (click)="decisionMode = null" class="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm">Back</button>
                <button type="submit" [disabled]="!decisionForm.get('denialReason')?.value"
                        class="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold text-sm disabled:opacity-50">Confirm Rejection</button>
              </div>
            </form>
            }
          </div>

        </div>
      </div>
    </div>
    }

    <!-- Toast -->
    @if (toast) {
    <div class="fixed bottom-6 right-6 z-60 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium transition-all"
         [ngClass]="toast.type === 'success' ? 'bg-green-600' : toast.type === 'warning' ? 'bg-yellow-500' : 'bg-red-600'">
      {{ toast.message }}
    </div>
    }
  `,
  styles: []
})
export class ReviewComponent implements OnInit, OnDestroy, AfterViewChecked {
  items: ReviewItem[] = [];
  filteredItems: ReviewItem[] = [];
  loading = false;
  searchQuery = '';
  statusFilter = 'ALL';
  riskFilter = 'ALL';
  detailItem: ReviewItem | null = null;
  decisionMode: 'APPROVE' | 'MORE_INFO' | 'REJECT' | null = null;
  decisionForm!: FormGroup;
  aiLoading = false;
  toast: { message: string; type: 'success' | 'warning' | 'error' } | null = null;
  reviewChatMessages: ReviewChatMsg[] = [];
  reviewChatLoading = false;
  reviewChatMessage = '';
  reviewChatSending = false;
  private reviewChatPollId: any;
  private shouldScrollReviewChat = false;
  @ViewChild('reviewChatBox') reviewChatBox?: ElementRef;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.decisionForm = this.fb.group({ notes: [''], denialReason: [''] });
    if (isPlatformBrowser(this.platformId)) this.loadQueue();
  }

  loadQueue(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/api/authorizations/queue?size=50&page=0`)
      .pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (res) => {
          try {
            const data = res?.data ?? res;
            const list: any[] = Array.isArray(data) ? data : (data?.content ?? []);
            this.items = list.map((a: any) => this.mapItem(a));
            this.applyFilters();
          } catch (e) { console.error('mapItem error:', e); }
        },
        error: (err) => { console.error('loadQueue error:', err); this.applyFilters(); }
      });
  }

  private mapItem(a: any): ReviewItem {
    return {
      id:               a.id ?? '',
      referenceNumber:  a.referenceNumber ?? '',
      patientName:      a.patientName ?? '',
      patientDOB:       a.patientDateOfBirth ?? '',
      procedureCode:    a.procedureCode ?? '',
      procedureName:    a.procedureDescription ?? a.procedureCode ?? '',
      diagnosisCode:    a.primaryDiagnosisCode ?? '',
      providerName:     a.providerName ?? '',
      providerOrg:      a.organizationName ?? a.payerName ?? '',
      submittedAt:      a.submittedAt ?? a.createdAt ?? '',
      aiScore:          a.aiScore ?? null,
      aiRiskLevel:      a.aiRiskLevel ?? null,
      aiRecommendation: '',
      aiWarnings:       [],
      aiSuggestions:    [],
      clinicalNotes:    a.clinicalNotes ?? '',
      priority:         a.priority ?? 'ROUTINE',
      status:           a.status ?? 'SUBMITTED',
      payerNotes:       a.payerNotes ?? '',
      rejectionReason:  a.rejectionReason ?? '',
      moreInfoNotes:    a.moreInfoNotes ?? '',
    };
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredItems = this.items.filter(r => {
      const matchQ = !q || r.patientName.toLowerCase().includes(q)
                       || r.procedureName.toLowerCase().includes(q)
                       || r.referenceNumber.toLowerCase().includes(q);
      const matchS = this.statusFilter === 'ALL' || r.status === this.statusFilter;
      const matchR = this.riskFilter   === 'ALL' || r.aiRiskLevel === this.riskFilter;
      return matchQ && matchS && matchR;
    });
  }

  countByStatus(s: string): number { return this.items.filter(i => i.status === s).length; }

  openDetail(item: ReviewItem): void {
    this.detailItem = item;
    this.decisionMode = null;
    this.decisionForm.reset();
    this.reviewChatMessages = [];
    this.loadReviewChat(item.id);
    if (this.reviewChatPollId) clearInterval(this.reviewChatPollId);
    this.reviewChatPollId = setInterval(() => {
      if (this.detailItem) this.loadReviewChat(this.detailItem.id);
    }, 15000);
  }

  openModal(item: ReviewItem, mode: 'REJECT'): void {
    this.detailItem = item;
    this.decisionMode = mode;
    this.decisionForm.reset();
  }

  closeModal(): void {
    this.detailItem = null;
    this.decisionMode = null;
    if (this.reviewChatPollId) { clearInterval(this.reviewChatPollId); this.reviewChatPollId = null; }
    this.reviewChatMessages = [];
    this.reviewChatMessage = '';
  }

  // ── Status actions ─────────────────────────────────────────────

  doStartReview(item: ReviewItem): void {
    this.http.post<any>(`${environment.apiUrl}/api/authorizations/${item.id}/under-review`, null).subscribe({
      next: () => {
        item.status = 'UNDER_REVIEW';
        this.applyFilters();
        this.cdr.detectChanges();
        this.showToast(`${item.referenceNumber} moved to Under Review.`, 'success');
      },
      error: (err) => this.showToast(err?.error?.message || err?.error?.error || 'Failed to start review.', 'error')
    });
  }

  doQuickApprove(item: ReviewItem): void {
    this.http.post<any>(`${environment.apiUrl}/api/authorizations/${item.id}/approve`, null).subscribe({
      next: () => {
        item.status = 'APPROVED';
        this.applyFilters();
        this.cdr.detectChanges();
        this.showToast(`${item.referenceNumber} approved.`, 'success');
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error?.error || 'Approve failed. Please try again.';
        this.showToast(msg, 'error');
      }
    });
  }

  doReconsider(item: ReviewItem): void {
    this.http.post<any>(`${environment.apiUrl}/api/authorizations/${item.id}/reconsider`, null).subscribe({
      next: () => {
        item.status = 'UNDER_REVIEW';
        this.applyFilters();
        this.cdr.detectChanges();
        this.showToast(`${item.referenceNumber} reopened for review.`, 'success');
      },
      error: (err) => this.showToast(err?.error?.message || err?.error?.error || 'Reconsider failed.', 'error')
    });
  }

  submitDecision(mode: 'APPROVE' | 'MORE_INFO' | 'REJECT'): void {
    if (!this.detailItem) return;
    const item = this.detailItem;
    const f = this.decisionForm.value;
    let url = '';
    if (mode === 'APPROVE') {
      const notes = f.notes ? `?notes=${encodeURIComponent(f.notes)}` : '';
      url = `${environment.apiUrl}/api/authorizations/${item.id}/approve${notes}`;
    } else if (mode === 'MORE_INFO') {
      const notes = encodeURIComponent(f.notes || 'Please provide additional documentation.');
      url = `${environment.apiUrl}/api/authorizations/${item.id}/request-info?notes=${notes}`;
    } else {
      const reason = encodeURIComponent(f.denialReason || f.notes || 'Rejected');
      url = `${environment.apiUrl}/api/authorizations/${item.id}/reject?reason=${reason}`;
    }
    this.http.post<any>(url, null).subscribe({
      next: () => {
        item.status = mode === 'MORE_INFO' ? 'MORE_INFO_REQUIRED'
                    : mode === 'APPROVE'   ? 'APPROVED' : 'REJECTED';
        const msg = mode === 'APPROVE'   ? `${item.referenceNumber} approved successfully.`
                  : mode === 'MORE_INFO' ? `Additional info requested for ${item.referenceNumber}.`
                  : `${item.referenceNumber} rejected.`;
        this.showToast(msg, mode === 'APPROVE' ? 'success' : mode === 'MORE_INFO' ? 'warning' : 'error');
        this.applyFilters();
        this.closeModal();
        this.cdr.detectChanges();
      },
      error: (err) => this.showToast(err?.error?.message || err?.error?.error || 'Action failed. Try again.', 'error')
    });
  }

  // ── AI Copilot ──────────────────────────────────────────────────

  runAI(): void {
    if (!this.detailItem || this.aiLoading) return;
    this.aiLoading = true;
    this.cdr.detectChanges();
    this.http.post<any>(`${environment.apiUrl}/api/authorizations/${this.detailItem.id}/ai-review/payer`, null)
      .pipe(finalize(() => { this.aiLoading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (res) => {
          const d = res?.data ?? res;
          if (this.detailItem) {
            this.detailItem.aiScore          = d.score ?? null;
            this.detailItem.aiRiskLevel      = d.riskLevel ?? null;
            this.detailItem.aiRecommendation = d.recommendation ?? '';
            this.detailItem.aiWarnings       = d.warnings ?? [];
            this.detailItem.aiSuggestions    = d.suggestions ?? [];
            // sync back to table row
            const tableRow = this.items.find(i => i.id === this.detailItem!.id);
            if (tableRow) { tableRow.aiScore = d.score; tableRow.aiRiskLevel = d.riskLevel; }
          }
          this.showToast('AI analysis complete.', 'success');
        },
        error: (err) => this.showToast(err?.error?.message ?? 'AI analysis failed.', 'error')
      });
  }

  // ── Style helpers ───────────────────────────────────────────────

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      SUBMITTED: 'Submitted', UNDER_REVIEW: 'Under Review',
      MORE_INFO_REQUIRED: 'More Info', APPROVED: 'Approved',
      REJECTED: 'Rejected', COMPLETED: 'Completed'
    };
    return m[s] ?? s;
  }

  getStatusClass(s: string): string {
    const m: Record<string, string> = {
      SUBMITTED:          'bg-blue-100 text-blue-700',
      UNDER_REVIEW:       'bg-yellow-100 text-yellow-700',
      MORE_INFO_REQUIRED: 'bg-orange-100 text-orange-700',
      APPROVED:           'bg-green-100 text-green-700',
      REJECTED:           'bg-red-100 text-red-700',
      COMPLETED:          'bg-gray-100 text-gray-600',
    };
    return m[s] || 'bg-gray-100 text-gray-700';
  }

  getRiskClass(r: string | null): string {
    return r === 'LOW'  ? 'bg-green-100 text-green-700'
         : r === 'HIGH' ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700';
  }

  getRecommendationClass(rec: string): string {
    return rec === 'APPROVE'          ? 'bg-green-100 text-green-700'
         : rec === 'REJECT'           ? 'bg-red-100 text-red-700'
         : rec === 'REQUEST_MORE_INFO' ? 'bg-orange-100 text-orange-700'
                                       : 'bg-gray-100 text-gray-600';
  }

  getAiScoreClass(score: number | null): string {
    if (score === null) return 'text-gray-400';
    return score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
  }

  getAiBarClass(score: number | null): string {
    if (score === null) return 'bg-gray-300';
    return score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  }

  private showToast(message: string, type: 'success' | 'warning' | 'error'): void {
    this.toast = { message, type };
    this.cdr.detectChanges();
    setTimeout(() => { this.toast = null; this.cdr.detectChanges(); }, 3500);
  }

  // ── Chat with provider ────────────────────────────────────────────

  loadReviewChat(authId: string): void {
    this.reviewChatLoading = true;
    this.http.get<any>(`${environment.apiUrl}/api/chat/authorizations/${authId}/messages?size=100`)
      .subscribe({
        next: (res) => {
          const raw: any[] = res?.data?.content ?? res?.data ?? [];
          this.reviewChatMessages = raw.map((m: any) => ({
            id:         m.id ?? '',
            senderName: m.senderName ?? m.senderUsername ?? '',
            senderRole: m.senderRole ?? 'PROVIDER',
            text:       m.content ?? m.text ?? '',
            timestamp:  m.timestamp ?? m.createdAt ?? '',
            isOwn:      m.senderRole === 'PAYER',
          }));
          this.shouldScrollReviewChat = true;
          this.reviewChatLoading = false;
          this.cdr.detectChanges();
        },
        error: () => { this.reviewChatLoading = false; }
      });
  }

  sendReviewChat(): void {
    const text = this.reviewChatMessage.trim();
    if (!text || !this.detailItem || this.reviewChatSending) return;
    this.reviewChatSending = true;
    this.http.post<any>(
      `${environment.apiUrl}/api/chat/authorizations/${this.detailItem.id}/messages`,
      { content: text }
    ).subscribe({
      next: () => {
        this.reviewChatMessage = '';
        this.reviewChatSending = false;
        this.loadReviewChat(this.detailItem!.id);
      },
      error: () => { this.reviewChatSending = false; this.showToast('Failed to send message.', 'error'); }
    });
  }

  formatMsgTime(ts: string): string {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────

  ngAfterViewChecked(): void {
    if (this.shouldScrollReviewChat && this.reviewChatBox?.nativeElement) {
      const el = this.reviewChatBox.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScrollReviewChat = false;
    }
  }

  ngOnDestroy(): void {
    if (this.reviewChatPollId) { clearInterval(this.reviewChatPollId); this.reviewChatPollId = null; }
  }
}

