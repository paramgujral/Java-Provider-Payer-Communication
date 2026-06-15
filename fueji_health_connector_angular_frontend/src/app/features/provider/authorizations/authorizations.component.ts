import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/layout/header/header.component';
import { SidebarComponent } from '../../../shared/components/layout/sidebar/sidebar.component';
import { environment } from '../../../../environments/environment';

interface AuthRequest {
  id: string;
  referenceNumber: string;
  patientName: string;
  patientDOB: string;
  procedureCode: string;
  procedureName: string;
  diagnosisCode: string;
  payerName: string;
  status: 'DRAFT' | 'AI_REVIEW' | 'SUBMITTED' | 'UNDER_REVIEW' | 'MORE_INFO' | 'MORE_INFO_REQUIRED' | 'APPROVED' | 'REJECTED';
  aiScore: number | null;
  aiRiskLevel: string | null;
  submittedAt: string | null;
  createdAt: string;
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENT';
  clinicalNotes: string;
  payerNotes: string;
  rejectionReason: string;
  moreInfoNotes: string;
}

interface ChatMsg {
  id: string;
  senderName: string;
  senderRole: 'PROVIDER' | 'PAYER';
  text: string;
  timestamp: string;
  isOwn: boolean;
}

@Component({
  selector: 'app-authorizations',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-50">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <app-header></app-header>
        <main class="flex-1 overflow-y-auto px-4 md:px-6 py-8">
          <div class="max-w-7xl mx-auto">

            <!-- Header -->
            <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Authorization Requests</h1>
                <p class="text-gray-500 mt-1">Create and track prior authorization requests</p>
              </div>
              <button (click)="openCreateModal()"
                      class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-sm">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                New Request
              </button>
            </div>

            <!-- Stats Row -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              @for (s of statusStats; track s.label) {
              <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <p class="text-xs text-gray-500 font-medium">{{ s.label }}</p>
                <p class="text-2xl font-bold mt-1" [ngClass]="s.color">{{ s.count }}</p>
              </div>
              }
            </div>

            <!-- Search & Filter -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
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
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="MORE_INFO">More Info Needed</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <!-- Error Banner -->
            @if (loadError) {
              <div class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                {{ loadError }}
                <button (click)="loadAuthorizations()" class="ml-auto text-xs underline">Retry</button>
              </div>
            }

            <!-- Requests Table -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50 border-b border-gray-100">
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700">Reference</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700">Patient</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700 hidden md:table-cell">Procedure</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700 hidden lg:table-cell">Payer</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700 hidden lg:table-cell">AI Score</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700">Status</th>
                      <th class="text-right px-5 py-3.5 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    @for (r of filteredRequests; track r.id) {
                    <tr class="hover:bg-gray-50 transition">
                      <td class="px-5 py-4">
                        <p class="font-mono text-xs text-blue-700 font-semibold">{{ r.referenceNumber }}</p>
                        <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(r.createdAt) }}</p>
                        <span class="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded text-blue-600 text-[10px] font-semibold">
                          <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>FHIR R4
                        </span>
                      </td>
                      <td class="px-5 py-4">
                        <p class="font-medium text-gray-900">{{ r.patientName }}</p>
                        <p class="text-xs text-gray-500">DOB: {{ r.patientDOB }}</p>
                      </td>
                      <td class="px-5 py-4 hidden md:table-cell">
                        <p class="text-gray-900">{{ r.procedureName }}</p>
                        <p class="text-xs text-gray-500 font-mono">{{ r.procedureCode }} / {{ r.diagnosisCode }}</p>
                      </td>
                      <td class="px-5 py-4 text-gray-700 text-xs hidden lg:table-cell">{{ r.payerName }}</td>
                      <td class="px-5 py-4 hidden lg:table-cell">
                        @if (r.aiScore !== null) {
                        <div class="flex items-center gap-2">
                          <div class="flex-1 h-1.5 bg-gray-100 rounded-full max-w-16">
                            <div class="h-1.5 rounded-full" [style.width]="r.aiScore + '%'" [ngClass]="getAiBarClass(r.aiScore)"></div>
                          </div>
                          <span class="text-xs font-semibold" [ngClass]="getAiScoreClass(r.aiScore)">{{ r.aiScore }}</span>
                        </div>
                        } @else {
                        <span class="text-gray-400 text-xs">Not reviewed</span>
                        }
                      </td>
                      <td class="px-5 py-4">
                        <div class="flex flex-col gap-1">
                          <span class="px-2.5 py-1 text-xs font-semibold rounded-full w-fit" [ngClass]="getStatusClass(r.status)">
                            {{ getStatusLabel(r.status) }}
                          </span>
                          @if (r.priority !== 'ROUTINE') {
                          <span class="px-2 py-0.5 text-xs rounded w-fit" [ngClass]="r.priority === 'EMERGENT' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'">
                            {{ r.priority }}
                          </span>
                          }
                        </div>
                      </td>
                      <td class="px-5 py-4">
                        <div class="flex items-center justify-end gap-2">
                          <button (click)="viewDetail(r)" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View Details">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          </button>
                          @if (r.status === 'DRAFT' || r.status === 'AI_REVIEW') {
                          <button (click)="runAiReview(r)"
                                  class="px-2.5 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
                            {{ r.status === 'AI_REVIEW' ? 'Retry AI' : 'AI Review' }}
                          </button>
                          <button (click)="confirmSubmit(r)"
                                  class="px-2.5 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                            Submit
                          </button>
                          }
                          @if (r.status === 'MORE_INFO_REQUIRED') {
                          <button (click)="viewDetail(r)"
                                  class="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition">
                            Provide Info
                          </button>
                          }
                        </div>
                      </td>
                    </tr>
                    }
                    @if (loading) {
                    <tr>
                      <td colspan="7" class="px-5 py-12 text-center text-gray-400">
                        <div class="flex items-center justify-center gap-2">
                          <svg class="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                          Loading requests...
                        </div>
                      </td>
                    </tr>
                    } @else if (filteredRequests.length === 0) {
                    <tr>
                      <td colspan="7" class="px-5 py-12 text-center text-gray-400">No authorization requests found</td>
                    </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Create Request Modal -->
    @if (showCreateModal) {
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.5)">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 class="text-lg font-bold text-gray-900">New Authorization Request</h3>
            <p class="text-xs text-gray-500 mt-0.5">Complete all required fields for AI review</p>
          </div>
          <button (click)="closeCreateModal()" class="text-gray-400 hover:text-gray-600 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <form [formGroup]="createForm" (ngSubmit)="saveRequest()" class="px-6 py-5 space-y-5">
          <!-- Patient Section -->
          <div>
            <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
              Patient Information
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                <input formControlName="patientName" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="John Doe">
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Date of Birth *</label>
                <input formControlName="patientDOB" type="date" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Insurance / Member ID *</label>
                <input formControlName="memberId" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="MBR-123456">
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Payer *</label>
                <select formControlName="payerId" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
                  <option value="">Select payer...</option>
                  @for (p of payers; track p.id) {
                    <option [value]="p.id">{{ p.name }}</option>
                  }
                  @if (payers.length === 0) {
                    <option value="" disabled>Loading payers...</option>
                  }
                </select>
              </div>
            </div>
          </div>

          <!-- Clinical Section -->
          <div>
            <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
              Clinical Information
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Procedure Code (CPT) *</label>
                <input formControlName="procedureCode" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="27447">
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Procedure Name *</label>
                <input formControlName="procedureName" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Total Knee Arthroplasty">
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Primary Diagnosis (ICD-10) *</label>
                <input formControlName="diagnosisCode" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="M17.11">
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Priority *</label>
                <select formControlName="priority" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="EMERGENT">Emergent</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Clinical Notes -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Clinical Notes *</label>
            <textarea formControlName="clinicalNotes" rows="3"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                      placeholder="Describe the medical necessity and clinical findings..."></textarea>
          </div>

          <div class="bg-purple-50 rounded-lg p-3 flex items-start gap-3 text-xs text-purple-700">
            <svg class="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            Save as draft first, then use AI Review to get recommendations before submitting to the payer.
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" (click)="closeCreateModal()" class="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm">
              Cancel
            </button>
            <button type="submit" [disabled]="createForm.invalid"
                    class="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50">
              Save as Draft
            </button>
          </div>
        </form>
      </div>
    </div>
    }

    <!-- Detail Modal -->
    @if (selectedRequest) {
    <div class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 overflow-y-auto" style="background: rgba(0,0,0,0.5)">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mb-8">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ selectedRequest.referenceNumber }}</h3>
            <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full mt-1 inline-block" [ngClass]="getStatusClass(selectedRequest.status)">
              {{ getStatusLabel(selectedRequest.status) }}
            </span>
          </div>
          <button (click)="closeDetail()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="px-6 py-5 space-y-5 text-sm">

          <!-- Status Timeline -->
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Request Journey</p>
            <div class="flex items-center">
              @for (step of getTimelineSteps(selectedRequest); track step.label; let last = $last) {
              <div class="flex flex-col items-center" [style.flex]="last ? '0 0 auto' : '1'">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0"
                     [ngClass]="step.done ? 'bg-blue-600 border-blue-600 text-white' : step.active ? 'bg-white border-blue-400 text-blue-600' : 'bg-gray-100 border-gray-200 text-gray-400'">
                  @if (step.done) {
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  } @else {
                  {{ $index + 1 }}
                  }
                </div>
                <p class="text-xs mt-1 font-medium text-center w-16"
                   [ngClass]="step.done ? 'text-blue-700' : step.active ? 'text-blue-500' : 'text-gray-400'">
                  {{ step.label }}
                </p>
                @if (step.date) {
                <p class="text-xs text-gray-400 text-center">{{ formatDate(step.date) }}</p>
                }
              </div>
              @if (!last) {
              <div class="flex-1 h-0.5 mx-1 -mt-5" [ngClass]="step.done ? 'bg-blue-500' : 'bg-gray-200'"></div>
              }
              }
            </div>
          </div>

          <!-- Info grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-400">Patient</p><p class="font-medium text-gray-900">{{ selectedRequest.patientName }}</p></div>
            <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-400">DOB</p><p class="font-medium text-gray-900">{{ selectedRequest.patientDOB || '—' }}</p></div>
            <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-400">Procedure</p><p class="font-medium text-gray-900">{{ selectedRequest.procedureName }}</p><p class="font-mono text-xs text-gray-500">{{ selectedRequest.procedureCode }}</p></div>
            <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-400">Diagnosis (ICD-10)</p><p class="font-mono text-gray-900">{{ selectedRequest.diagnosisCode }}</p></div>
            <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-400">Payer</p><p class="font-medium text-gray-900">{{ selectedRequest.payerName }}</p></div>
            <div class="bg-gray-50 rounded-lg p-3"><p class="text-xs text-gray-400">Priority</p><p class="font-medium text-gray-900">{{ selectedRequest.priority }}</p></div>
          </div>

          <!-- AI score -->
          @if (selectedRequest.aiScore !== null) {
          <div class="rounded-xl p-4 bg-purple-50 border border-purple-100">
            <p class="text-xs font-semibold text-purple-700 mb-2">AI Review Results</p>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-purple-800">Confidence Score</span>
              <span class="text-xl font-bold" [ngClass]="getAiScoreClass(selectedRequest.aiScore!)">{{ selectedRequest.aiScore }}/100</span>
            </div>
            <div class="h-2 bg-purple-100 rounded-full">
              <div class="h-2 rounded-full" [style.width]="selectedRequest.aiScore + '%'" [ngClass]="getAiBarClass(selectedRequest.aiScore!)"></div>
            </div>
            <p class="text-xs text-purple-600 mt-2">Risk Level: <strong>{{ selectedRequest.aiRiskLevel }}</strong></p>
          </div>
          }

          <!-- Payer decision notes -->
          @if (selectedRequest.payerNotes || selectedRequest.rejectionReason || selectedRequest.moreInfoNotes) {
          <div class="rounded-xl p-4 border"
               [ngClass]="selectedRequest.status === 'APPROVED' ? 'bg-green-50 border-green-200' : selectedRequest.status === 'REJECTED' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'">
            <p class="text-xs font-semibold mb-1"
               [ngClass]="selectedRequest.status === 'APPROVED' ? 'text-green-700' : selectedRequest.status === 'REJECTED' ? 'text-red-700' : 'text-amber-700'">
              Payer Decision Notes
            </p>
            <p class="text-sm">{{ selectedRequest.payerNotes || selectedRequest.rejectionReason || selectedRequest.moreInfoNotes }}</p>
          </div>
          }

          <!-- ── ACTION PANEL ── -->
          <div class="rounded-xl overflow-hidden border border-gray-200">
            <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</p>
            </div>
            <div class="p-4">

              <!-- AI_REVIEW (stuck) -->
              @if (selectedRequest.status === 'AI_REVIEW') {
              <div class="space-y-3">
                <div class="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <svg class="w-4 h-4 text-purple-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  <p class="text-xs text-purple-700">A previous AI review did not complete. Retry AI review or submit directly to your payer.</p>
                </div>
                <div class="flex gap-3">
                  <button (click)="runAiReviewFromDetail()"
                          [disabled]="actionLoading"
                          class="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition">
                    @if (actionLoading && actionType === 'ai') {
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    } @else {
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                    }
                    Retry AI Review
                  </button>
                  <button (click)="confirmSubmitFromDetail()"
                          [disabled]="actionLoading"
                          class="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                    @if (actionLoading && actionType === 'submit') {
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                    }
                    Submit to Payer
                  </button>
                </div>
              </div>
              }

              <!-- DRAFT -->
              @if (selectedRequest.status === 'DRAFT') {
              <div class="space-y-3">
                <p class="text-xs text-gray-500">Draft saved. Run AI review for better approval chances, then submit to your payer.</p>
                <div class="flex gap-3">
                  <button (click)="runAiReviewFromDetail()"
                          [disabled]="actionLoading"
                          class="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition">
                    @if (actionLoading && actionType === 'ai') {
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    } @else {
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
                    }
                    Run AI Review
                  </button>
                  <button (click)="confirmSubmitFromDetail()"
                          [disabled]="actionLoading"
                          class="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                    @if (actionLoading && actionType === 'submit') {
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                    }
                    Submit to Payer
                  </button>
                </div>
                <button (click)="deleteDraft(selectedRequest!)"
                        [disabled]="actionLoading"
                        class="w-full py-2 text-xs font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50 transition">
                  Delete Draft
                </button>
              </div>
              }

              <!-- SUBMITTED -->
              @if (selectedRequest.status === 'SUBMITTED') {
              <div class="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                <svg class="w-5 h-5 text-blue-500 mt-0.5 shrink-0 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                <div>
                  <p class="text-sm font-semibold text-blue-700">Awaiting Payer Review</p>
                  <p class="text-xs text-blue-500 mt-0.5">
                    Submitted {{ selectedRequest.submittedAt ? formatDate(selectedRequest.submittedAt) : 'recently' }}.
                    You will be notified when the payer responds.
                  </p>
                </div>
              </div>
              }

              <!-- UNDER_REVIEW -->
              @if (selectedRequest.status === 'UNDER_REVIEW') {
              <div class="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <svg class="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <div>
                  <p class="text-sm font-semibold text-yellow-700">Under Active Review</p>
                  <p class="text-xs text-yellow-600 mt-0.5">The payer is actively reviewing your request. A decision is expected soon. Use the chat to communicate.</p>
                </div>
              </div>
              }

              <!-- MORE_INFO_REQUIRED -->
              @if (selectedRequest.status === 'MORE_INFO_REQUIRED' || selectedRequest.status === 'MORE_INFO') {
              <div class="space-y-3">
                <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div class="flex items-center gap-2 mb-1">
                    <svg class="w-4 h-4 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    <p class="text-xs font-semibold text-amber-700">Payer Requested Additional Information</p>
                  </div>
                  <p class="text-xs text-amber-700 pl-6">{{ selectedRequest.moreInfoNotes || 'Please provide additional clinical documentation or clarification.' }}</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-700 mb-1.5 block">Your Additional Information *</label>
                  <textarea [(ngModel)]="additionalInfoText" rows="4"
                            placeholder="Describe the additional clinical findings, test results, or documentation requested by the payer..."
                            class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"></textarea>
                </div>
                <button (click)="provideAdditionalInfo(selectedRequest!)"
                        [disabled]="!additionalInfoText.trim() || actionLoading"
                        class="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition">
                  @if (actionLoading && actionType === 'info') {
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                  }
                  Submit Additional Info &amp; Resubmit
                </button>
              </div>
              }

              <!-- APPROVED -->
              @if (selectedRequest.status === 'APPROVED') {
              <div class="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>
                <div>
                  <p class="text-base font-bold text-green-700">Authorization Approved</p>
                  <p class="text-xs text-green-600 mt-0.5">{{ selectedRequest.payerNotes || 'This request has been approved by the payer.' }}</p>
                </div>
              </div>
              }

              <!-- REJECTED -->
              @if (selectedRequest.status === 'REJECTED') {
              <div class="space-y-3">
                <div class="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                  </div>
                  <div>
                    <p class="text-base font-bold text-red-700">Authorization Rejected</p>
                    <p class="text-xs text-red-600 mt-0.5">{{ selectedRequest.rejectionReason || selectedRequest.payerNotes || 'Request was not approved.' }}</p>
                  </div>
                </div>
                <button (click)="closeDetail(); openCreateModal()"
                        class="w-full py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                  + Create Similar New Request
                </button>
              </div>
              }

            </div>
          </div>

          <!-- Per-request chat -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <div class="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
                <span class="text-sm font-semibold text-gray-700">Messages with Payer</span>
                @if (chatLoading) {
                <svg class="w-3.5 h-3.5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                }
              </div>
              <button (click)="loadChatMessages(selectedRequest!.id)" class="text-xs text-gray-400 hover:text-blue-600">Refresh</button>
            </div>
            <div #chatBox class="h-48 overflow-y-auto px-4 py-3 space-y-2 bg-white">
              @if (!chatLoading && chatMessages.length === 0) {
              <p class="text-xs text-gray-400 text-center py-6">No messages yet. Send the first message to the payer.</p>
              }
              @for (m of chatMessages; track m.id) {
              <div class="flex" [class.justify-end]="m.isOwn">
                <div class="max-w-xs">
                  @if (!m.isOwn) {
                  <p class="text-xs text-gray-400 mb-0.5 ml-1">{{ m.senderName || 'Payer' }}</p>
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
            @if (selectedRequest.status !== 'DRAFT') {
            <div class="border-t border-gray-100 px-3 py-2.5 flex gap-2 bg-gray-50">
              <input [(ngModel)]="chatMessage" (keydown.enter)="sendChatMessage()"
                     placeholder="Type a message to the payer..."
                     class="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <button (click)="sendChatMessage()" [disabled]="!chatMessage.trim() || chatSending"
                      class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition disabled:opacity-40">
                @if (chatSending) { ... } @else { Send }
              </button>
            </div>
            } @else {
            <div class="border-t border-gray-100 px-4 py-2.5 bg-gray-50 text-xs text-gray-400 text-center">
              Submit this request to message the payer
            </div>
            }
          </div>

        </div>
      </div>
    </div>
    }

    <!-- AI-review warning dialog -->
    @if (pendingSubmit) {
    <div class="fixed inset-0 z-60 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.5)">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900">AI Review Recommended</h3>
            <p class="text-xs text-gray-500 mt-0.5">Requirement 2 of the FHIR workflow</p>
          </div>
        </div>
        <p class="text-sm text-gray-600 mb-5">
          This request has not been reviewed by the AI Copilot. Running AI review before submission helps detect errors and improves approval rates.
        </p>
        <div class="flex gap-3">
          <button (click)="runAiThenSubmit()" class="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition">
            Run AI Review First
          </button>
          <button (click)="proceedSubmit()" class="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            Submit Anyway
          </button>
        </div>
        <button (click)="pendingSubmit = null" class="w-full mt-2 py-1.5 text-xs text-gray-400 hover:text-gray-600">Cancel</button>
      </div>
    </div>
    }

    <!-- Toast -->
    @if (toast) {
    <div class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-white text-sm font-medium"
         [ngClass]="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'">
      {{ toast.message }}
    </div>
    }
  `,
  styles: []
})
export class AuthorizationsComponent implements OnInit, OnDestroy, AfterViewChecked {
  requests: AuthRequest[] = [];
  filteredRequests: AuthRequest[] = [];
  loading = false;
  loadError = '';
  searchQuery = '';
  statusFilter = 'ALL';
  showCreateModal = false;
  selectedRequest: AuthRequest | null = null;
  createForm!: FormGroup;
  toast: { message: string; type: 'success' | 'error' } | null = null;
  payers: { id: string; name: string }[] = [];

  statusStats: { label: string; count: number; color: string }[] = [];

  pendingSubmit: AuthRequest | null = null;
  actionLoading = false;
  actionType = '';
  additionalInfoText = '';
  chatMessages: ChatMsg[] = [];
  chatLoading = false;
  chatMessage = '';
  chatSending = false;
  private chatPollId: any;
  private shouldScrollChat = false;
  @ViewChild('chatBox') chatBox?: ElementRef;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.filteredRequests = [];
    this.buildStats();
    this.createForm = this.fb.group({
      patientName:    ['', Validators.required],
      patientDOB:     ['', Validators.required],
      memberId:       ['', Validators.required],
      payerId:        ['', Validators.required],
      procedureCode:  ['', Validators.required],
      procedureName:  ['', Validators.required],
      diagnosisCode:  ['', Validators.required],
      priority:       ['ROUTINE'],
      clinicalNotes:  ['', Validators.required]
    });
    if (isPlatformBrowser(this.platformId)) {
      this.loadAuthorizations();
      this.loadPayers();
    }
  }

  loadAuthorizations(): void {
    this.loading = true;
    this.loadError = '';
    this.http.get<any>(`${environment.apiUrl}/api/authorizations/my?size=50&page=0`)
      .pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (res) => {
          try {
            const data = res?.data ?? res;
            const list: any[] = Array.isArray(data) ? data : (data?.content ?? []);
            this.requests = list.map((a: any) => this.mapAuth(a));
            this.applyFilters();
            this.buildStats();
          } catch (e) {
            console.error('mapAuth error:', e);
          }
        },
        error: (err) => {
          this.loadError = err?.error?.message ?? err?.message ?? 'Failed to load authorization requests.';
          console.error('loadAuthorizations error:', err);
          this.applyFilters();
        }
      });
  }

  private loadPayers(): void {
    this.http.get<any>(`${environment.apiUrl}/api/payers?size=100`).subscribe({
      next: (res) => {
        const list: any[] = res?.data?.content ?? res?.data ?? [];
        this.payers = list.map(p => ({ id: p.id, name: p.organizationName ?? `${p.firstName} ${p.lastName}` }));
      },
      error: () => {}
    });
  }

  private mapAuth(a: any): AuthRequest {
    return {
      id:              a.id ?? '',
      referenceNumber: a.referenceNumber ?? '',
      patientName:     a.patientName ?? '',
      patientDOB:      a.patientDateOfBirth ?? a.patientDOB ?? '',
      procedureCode:   a.procedureCode ?? '',
      procedureName:   a.procedureDescription ?? a.procedureName ?? '',
      diagnosisCode:   a.primaryDiagnosisCode ?? a.diagnosisCode ?? '',
      payerName:       a.payerName ?? '',
      status:          a.status ?? 'DRAFT',
      aiScore:         a.aiScore ?? null,
      aiRiskLevel:     a.aiRiskLevel ?? null,
      submittedAt:     a.submittedAt ?? null,
      createdAt:       a.createdAt ?? new Date().toISOString(),
      priority:        a.priority ?? 'ROUTINE',
      clinicalNotes:   a.clinicalNotes ?? '',
      payerNotes:      a.payerNotes ?? '',
      rejectionReason: a.rejectionReason ?? '',
      moreInfoNotes:   a.moreInfoNotes ?? '',
    };
  }

  buildStats(): void {
    this.statusStats = [
      { label: 'Draft',        count: this.requests.filter(r => r.status === 'DRAFT' || r.status === 'AI_REVIEW').length,       color: 'text-gray-700' },
      { label: 'Submitted',    count: this.requests.filter(r => r.status === 'SUBMITTED').length,                               color: 'text-blue-600' },
      { label: 'Under Review', count: this.requests.filter(r => r.status === 'UNDER_REVIEW').length,                            color: 'text-yellow-600' },
      { label: 'Approved',     count: this.requests.filter(r => r.status === 'APPROVED').length,                                color: 'text-green-600' },
      { label: 'Rejected',     count: this.requests.filter(r => r.status === 'REJECTED').length,                                color: 'text-red-600' }
    ];
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredRequests = this.requests.filter(r => {
      const matchQuery = !q || r.patientName.toLowerCase().includes(q) || r.procedureName.toLowerCase().includes(q) || r.referenceNumber.toLowerCase().includes(q);
      const matchStatus = this.statusFilter === 'ALL' || r.status === this.statusFilter;
      return matchQuery && matchStatus;
    });
  }

  getStatusClass(s: string): string {
    const m: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-600',
      AI_REVIEW: 'bg-purple-100 text-purple-700',
      SUBMITTED: 'bg-blue-100 text-blue-700',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
      MORE_INFO_REQUIRED: 'bg-orange-100 text-orange-700',
      MORE_INFO: 'bg-orange-100 text-orange-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700'
    };
    return m[s] || 'bg-gray-100 text-gray-600';
  }

  getStatusLabel(s: string): string {
    const m: Record<string, string> = {
      DRAFT: 'Draft', AI_REVIEW: 'AI Review', SUBMITTED: 'Submitted',
      UNDER_REVIEW: 'Under Review', MORE_INFO_REQUIRED: 'More Info Needed',
      MORE_INFO: 'More Info Needed', APPROVED: 'Approved', REJECTED: 'Rejected'
    };
    return m[s] || s.replace(/_/g, ' ');
  }

  getAiScoreClass(score: number): string {
    return score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
  }

  getAiBarClass(score: number): string {
    return score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  openCreateModal():  void { this.showCreateModal = true; }
  closeCreateModal(): void { this.showCreateModal = false; this.createForm.reset({ priority: 'ROUTINE' }); }

  saveRequest(): void {
    if (this.createForm.invalid) return;
    const v = this.createForm.value;
    const payload = {
      patientName:          v.patientName,
      patientDateOfBirth:   v.patientDOB,
      insuranceNumber:      v.memberId,
      memberId:             v.memberId,
      payerId:              v.payerId,
      procedureCode:        v.procedureCode,
      procedureDescription: v.procedureName,
      primaryDiagnosisCode: v.diagnosisCode,
      diagnosisDescription: v.diagnosisCode,
      clinicalNotes:        v.clinicalNotes,
      priority:             v.priority,
    };
    this.http.post<any>(`${environment.apiUrl}/api/authorizations`, payload).subscribe({
      next: (res) => {
        if (res?.data) {
          this.requests.unshift(this.mapAuth(res.data));
          this.applyFilters();
          this.buildStats();
        }
        this.closeCreateModal();
        this.showToast('Draft saved successfully.', 'success');
      },
      error: (err) => {
        const errs: any[] = err?.error?.errors ?? [];
        const msg = errs.length > 0
          ? errs.map((e: any) => e.message ?? e.defaultMessage ?? JSON.stringify(e)).join('; ')
          : (err?.error?.message ?? 'Failed to save request.');
        this.showToast(msg, 'error');
      }
    });
  }

  runAiReview(r: AuthRequest): void {
    this.http.post<any>(`${environment.apiUrl}/api/authorizations/${r.id}/ai-review`, {}).subscribe({
      next: (res) => {
        const d = res?.data;
        if (d) {
          r.aiScore = d.score ?? d.aiScore ?? null;
          r.aiRiskLevel = d.riskLevel ?? d.aiRiskLevel ?? null;
        }
        r.status = 'DRAFT';
        this.applyFilters();
        this.buildStats();
        this.cdr.detectChanges();
        this.showToast(`AI Review complete. Score: ${r.aiScore}/100 — Risk: ${r.aiRiskLevel}`, 'success');
      },
      error: (err) => {
        const msg = err?.error?.message || 'AI review failed. Try again.';
        this.showToast(msg, 'error');
      }
    });
  }

  confirmSubmit(r: AuthRequest): void {
    if (r.aiScore === null) {
      this.pendingSubmit = r;
    } else {
      this.submitRequest(r);
    }
  }

  runAiThenSubmit(): void {
    const r = this.pendingSubmit;
    if (!r) return;
    this.pendingSubmit = null;
    this.runAiReview(r);
  }

  proceedSubmit(): void {
    const r = this.pendingSubmit;
    this.pendingSubmit = null;
    if (!r) return;
    // If the modal is open for this request use the modal-aware path
    if (this.selectedRequest?.id === r.id) {
      this.submitRequestFromDetail(r);
    } else {
      this.submitRequest(r);
    }
  }

  submitRequest(r: AuthRequest): void {
    this.http.post<any>(`${environment.apiUrl}/api/authorizations/${r.id}/submit`, {}).subscribe({
      next: () => {
        r.status = 'SUBMITTED';
        r.submittedAt = new Date().toISOString();
        this.applyFilters();
        this.buildStats();
        this.cdr.detectChanges();
        this.showToast(`${r.referenceNumber} submitted to payer successfully.`, 'success');
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.message ?? 'Submit failed. Try again.';
        this.showToast(msg, 'error');
      }
    });
  }

  // ── Detail modal action wrappers ─────────────────────────────────────────

  runAiReviewFromDetail(): void {
    if (!this.selectedRequest) return;
    this.actionLoading = true;
    this.actionType = 'ai';
    this.http.post<any>(`${environment.apiUrl}/api/authorizations/${this.selectedRequest.id}/ai-review`, {}).subscribe({
      next: (res) => {
        const d = res?.data;
        if (d && this.selectedRequest) {
          this.selectedRequest.aiScore    = d.score ?? d.aiScore ?? null;
          this.selectedRequest.aiRiskLevel = d.riskLevel ?? d.aiRiskLevel ?? null;
          this.selectedRequest.status = 'DRAFT';
          // Sync back to list
          const idx = this.requests.findIndex(r => r.id === this.selectedRequest!.id);
          if (idx >= 0) {
            this.requests[idx].aiScore = this.selectedRequest.aiScore;
            this.requests[idx].aiRiskLevel = this.selectedRequest.aiRiskLevel;
            this.requests[idx].status = 'DRAFT';
          }
          this.applyFilters();
          this.buildStats();
        }
        this.actionLoading = false;
        this.actionType = '';
        this.showToast(`AI Review complete. Score: ${this.selectedRequest?.aiScore}/100 — Risk: ${this.selectedRequest?.aiRiskLevel}`, 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.actionLoading = false;
        this.actionType = '';
        this.showToast(err?.error?.message || 'AI review failed.', 'error');
      }
    });
  }

  confirmSubmitFromDetail(): void {
    if (!this.selectedRequest) return;
    if (this.selectedRequest.aiScore === null) {
      this.pendingSubmit = this.selectedRequest;
    } else {
      this.submitRequestFromDetail(this.selectedRequest);
    }
  }

  private submitRequestFromDetail(r: AuthRequest): void {
    this.actionLoading = true;
    this.actionType = 'submit';
    this.http.post<any>(`${environment.apiUrl}/api/authorizations/${r.id}/submit`, {}).subscribe({
      next: () => {
        r.status = 'SUBMITTED';
        r.submittedAt = new Date().toISOString();
        // Sync back to list
        const idx = this.requests.findIndex(x => x.id === r.id);
        if (idx >= 0) { this.requests[idx].status = 'SUBMITTED'; this.requests[idx].submittedAt = r.submittedAt; }
        this.applyFilters();
        this.buildStats();
        this.actionLoading = false;
        this.actionType = '';
        this.showToast(`${r.referenceNumber} submitted to payer.`, 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.actionLoading = false;
        this.actionType = '';
        this.showToast(err?.error?.message ?? 'Submit failed.', 'error');
      }
    });
  }

  provideAdditionalInfo(r: AuthRequest): void {
    const notes = this.additionalInfoText.trim();
    if (!notes) return;
    this.actionLoading = true;
    this.actionType = 'info';
    this.http.post<any>(
      `${environment.apiUrl}/api/authorizations/${r.id}/provide-info?additionalNotes=${encodeURIComponent(notes)}`,
      {}
    ).subscribe({
      next: () => {
        r.status = 'SUBMITTED';
        r.submittedAt = new Date().toISOString();
        const idx = this.requests.findIndex(x => x.id === r.id);
        if (idx >= 0) { this.requests[idx].status = 'SUBMITTED'; this.requests[idx].submittedAt = r.submittedAt; }
        this.applyFilters();
        this.buildStats();
        this.additionalInfoText = '';
        this.actionLoading = false;
        this.actionType = '';
        this.showToast(`${r.referenceNumber} resubmitted with additional information.`, 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.actionLoading = false;
        this.actionType = '';
        this.showToast(err?.error?.message ?? 'Failed to submit additional info.', 'error');
      }
    });
  }

  deleteDraft(r: AuthRequest): void {
    if (!confirm(`Delete draft ${r.referenceNumber}? This cannot be undone.`)) return;
    this.actionLoading = true;
    this.actionType = 'delete';
    this.http.delete<any>(`${environment.apiUrl}/api/authorizations/${r.id}`).subscribe({
      next: () => {
        this.requests = this.requests.filter(x => x.id !== r.id);
        this.applyFilters();
        this.buildStats();
        this.actionLoading = false;
        this.actionType = '';
        this.closeDetail();
        this.showToast(`Draft ${r.referenceNumber} deleted.`, 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.actionLoading = false;
        this.actionType = '';
        this.showToast(err?.error?.message ?? 'Delete failed.', 'error');
      }
    });
  }

  // ── proceedSubmit override to also update modal state ────────────────────

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 3500);
  }

  // ── Detail modal ─────────────────────────────────────────────────────────

  viewDetail(r: AuthRequest): void {
    this.selectedRequest = r;
    this.chatMessages = [];
    this.loadChatMessages(r.id);
    if (this.chatPollId) clearInterval(this.chatPollId);
    this.chatPollId = setInterval(() => {
      if (this.selectedRequest) this.loadChatMessages(this.selectedRequest.id);
    }, 15000);
  }

  closeDetail(): void {
    this.selectedRequest = null;
    if (this.chatPollId) { clearInterval(this.chatPollId); this.chatPollId = null; }
    this.chatMessages = [];
    this.chatMessage = '';
    this.additionalInfoText = '';
    this.actionLoading = false;
    this.actionType = '';
  }

  // ── Chat ─────────────────────────────────────────────────────────────────

  loadChatMessages(authId: string): void {
    this.chatLoading = true;
    this.http.get<any>(`${environment.apiUrl}/api/chat/authorizations/${authId}/messages?size=100`)
      .subscribe({
        next: (res) => {
          const raw: any[] = res?.data?.content ?? res?.data ?? [];
          this.chatMessages = raw.map((m: any) => ({
            id:         m.id ?? '',
            senderName: m.senderName ?? m.senderUsername ?? '',
            senderRole: m.senderRole ?? 'PROVIDER',
            text:       m.content ?? m.text ?? '',
            timestamp:  m.timestamp ?? m.createdAt ?? '',
            isOwn:      m.senderRole === 'PROVIDER',
          }));
          this.shouldScrollChat = true;
          this.chatLoading = false;
          this.cdr.detectChanges();
        },
        error: () => { this.chatLoading = false; }
      });
  }

  sendChatMessage(): void {
    const text = this.chatMessage.trim();
    if (!text || !this.selectedRequest || this.chatSending) return;
    this.chatSending = true;
    this.http.post<any>(
      `${environment.apiUrl}/api/chat/authorizations/${this.selectedRequest.id}/messages`,
      { content: text }
    ).subscribe({
      next: () => {
        this.chatMessage = '';
        this.chatSending = false;
        this.loadChatMessages(this.selectedRequest!.id);
      },
      error: () => { this.chatSending = false; this.showToast('Failed to send message.', 'error'); }
    });
  }

  formatMsgTime(ts: string): string {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  // ── Status timeline ───────────────────────────────────────────────────────

  getTimelineSteps(r: AuthRequest): { label: string; done: boolean; active: boolean; date: string | null }[] {
    const order = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED'];
    const labels: Record<string, string> = {
      DRAFT: 'Draft', SUBMITTED: 'Submitted', UNDER_REVIEW: 'In Review', APPROVED: 'Decision'
    };
    const terminalIdx = ['APPROVED', 'REJECTED', 'MORE_INFO_REQUIRED', 'MORE_INFO'].includes(r.status) ? 3 : order.indexOf(r.status);
    return order.map((s, i) => ({
      label:  labels[s],
      done:   i < terminalIdx || (i === 3 && ['APPROVED', 'REJECTED', 'MORE_INFO_REQUIRED', 'MORE_INFO'].includes(r.status)),
      active: i === terminalIdx && !['APPROVED', 'REJECTED', 'MORE_INFO_REQUIRED', 'MORE_INFO'].includes(r.status),
      date:   s === 'SUBMITTED' ? r.submittedAt : s === 'DRAFT' ? r.createdAt : null
    }));
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngAfterViewChecked(): void {
    if (this.shouldScrollChat && this.chatBox?.nativeElement) {
      const el = this.chatBox.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScrollChat = false;
    }
  }

  ngOnDestroy(): void {
    if (this.chatPollId) { clearInterval(this.chatPollId); this.chatPollId = null; }
  }
}


