import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { LayoutModule } from '../../../shared/components/layout/layout.module';
import { environment } from '../../../../environments/environment';

interface AuditLog {
  id: string;
  userEmail: string;
  userRole: string;
  action: string;
  entityType: string;
  description: string;
  ipAddress: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutModule],
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
                <h1 class="text-3xl font-bold text-gray-900">Audit Logs</h1>
                <p class="text-gray-500 mt-1">Immutable system activity trail for compliance and security</p>
              </div>
              <button (click)="exportLogs()"
                      class="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium shadow-sm">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                Export CSV
              </button>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <p class="text-xs text-gray-500 font-medium">Total Events</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{{ logs.length }}</p>
              </div>
              <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <p class="text-xs text-gray-500 font-medium">Info</p>
                <p class="text-2xl font-bold text-blue-600 mt-1">{{ countBySeverity('INFO') }}</p>
              </div>
              <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <p class="text-xs text-gray-500 font-medium">Warnings</p>
                <p class="text-2xl font-bold text-yellow-600 mt-1">{{ countBySeverity('WARNING') }}</p>
              </div>
              <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <p class="text-xs text-gray-500 font-medium">Critical</p>
                <p class="text-2xl font-bold text-red-600 mt-1">{{ countBySeverity('CRITICAL') }}</p>
              </div>
            </div>

            <!-- Filters -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
              <div class="flex-1 relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="text" [(ngModel)]="searchQuery" (input)="applyFilters()"
                       placeholder="Search by user, action or description..."
                       class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              </div>
              <select [(ngModel)]="actionFilter" (change)="applyFilters()"
                      class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-36">
                <option value="ALL">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGIN_FAILED">Login Failed</option>
                <option value="AUTHORIZATION">Authorization</option>
                <option value="USER_MANAGEMENT">User Management</option>
                <option value="PASSWORD">Password</option>
              </select>
              <select [(ngModel)]="severityFilter" (change)="applyFilters()"
                      class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="ALL">All Severities</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <!-- Logs Table -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50 border-b border-gray-100">
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700">Timestamp</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700">User</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700 hidden md:table-cell">Action</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700 hidden lg:table-cell">Description</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700 hidden lg:table-cell">IP Address</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700">Severity</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    @for (log of paginatedLogs; track log.id) {
                    <tr class="hover:bg-gray-50 transition">
                      <td class="px-5 py-3">
                        <p class="text-gray-900 font-mono text-xs">{{ formatDate(log.timestamp) }}</p>
                      </td>
                      <td class="px-5 py-3">
                        <p class="text-gray-900 text-xs font-medium">{{ log.userEmail }}</p>
                        <p class="text-gray-400 text-xs">{{ log.userRole }}</p>
                      </td>
                      <td class="px-5 py-3 hidden md:table-cell">
                        <span class="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">{{ log.action }}</span>
                      </td>
                      <td class="px-5 py-3 text-gray-600 text-xs max-w-xs truncate hidden lg:table-cell">{{ log.description }}</td>
                      <td class="px-5 py-3 font-mono text-xs text-gray-500 hidden lg:table-cell">{{ log.ipAddress }}</td>
                      <td class="px-5 py-3">
                        <span class="px-2.5 py-1 rounded-full text-xs font-semibold" [ngClass]="getSeverityClass(log.severity)">
                          {{ log.severity }}
                        </span>
                      </td>
                    </tr>
                    }
                    @if (loading) {
                    <tr>
                      <td colspan="6" class="px-5 py-12 text-center text-gray-400">Loading audit logs...</td>
                    </tr>
                    }
                    @if (!loading && filteredLogs.length === 0) {
                    <tr>
                      <td colspan="6" class="px-5 py-12 text-center text-gray-400">No audit logs found</td>
                    </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <span class="text-xs text-gray-500">
                  Showing {{ paginatedLogs.length }} of {{ totalElements }} events (page {{ currentPage }}/{{ totalPages }})
                </span>
                <div class="flex items-center gap-1">
                  <button (click)="prevPage()" [disabled]="currentPage === 1"
                          class="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
                    Previous
                  </button>
                  <span class="px-3 py-1 text-xs text-gray-600">{{ currentPage }} / {{ totalPages }}</span>
                  <button (click)="nextPage()" [disabled]="currentPage === totalPages"
                          class="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: []
})
export class AuditLogsComponent implements OnInit {
  Math = Math;

  logs: AuditLog[] = [];

  filteredLogs: AuditLog[] = [];
  paginatedLogs: AuditLog[] = [];
  searchQuery = '';
  actionFilter = 'ALL';
  severityFilter = 'ALL';
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;
  totalElements = 0;
  loading = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLogs(0);
    }
  }

  private loadLogs(page: number): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/api/audit-logs?page=${page}&size=${this.pageSize}`)
      .pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (res) => {
          try {
            const pageData = res?.data ?? res;
            const list: any[] = Array.isArray(pageData) ? pageData : (pageData?.content ?? []);
            this.logs = list.map((l: any) => this.mapLog(l));
            this.totalElements = pageData?.totalElements ?? list.length;
            this.totalPages    = pageData?.totalPages    ?? 1;
            this.currentPage   = (pageData?.number ?? 0) + 1;
            this.applyFilters();
          } catch (e) {
            console.error('Audit log mapping error:', e);
          }
        },
        error: () => {}
      });
  }

  private mapLog(l: any): AuditLog {
    return {
      id:          l.id ?? '',
      userEmail:   l.userEmail ?? '',
      userRole:    l.userRole  ?? '',
      action:      l.action    ?? '',
      entityType:  l.entityType ?? '',
      description: l.description ?? '',
      ipAddress:   l.ipAddress ?? '',
      timestamp:   l.timestamp ?? '',
      severity:    this.deriveSeverity(l),
    };
  }

  private deriveSeverity(l: any): 'INFO' | 'WARNING' | 'CRITICAL' {
    const action = (l.action ?? '').toUpperCase();
    if (action.includes('LOCKED') || action.includes('BLOCKED') || action.includes('CRITICAL')) return 'CRITICAL';
    if (action.includes('FAILED') || action.includes('ERROR') || l.success === false) return 'WARNING';
    return 'INFO';
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredLogs = this.logs.filter(l => {
      const matchQuery = !q ||
        l.userEmail.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q);
      const matchAction   = this.actionFilter   === 'ALL' || l.action.includes(this.actionFilter);
      const matchSeverity = this.severityFilter === 'ALL' || l.severity === this.severityFilter;
      return matchQuery && matchAction && matchSeverity;
    });
    this.paginatedLogs = this.filteredLogs;
  }

  updatePagination(): void {
    this.paginatedLogs = this.filteredLogs;
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadLogs(this.currentPage - 2);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadLogs(this.currentPage);
    }
  }

  countBySeverity(s: string): number { return this.logs.filter(l => l.severity === s).length; }

  getSeverityClass(severity: string): string {
    const m: Record<string, string> = {
      INFO:     'bg-blue-100 text-blue-700',
      WARNING:  'bg-yellow-100 text-yellow-700',
      CRITICAL: 'bg-red-100 text-red-700'
    };
    return m[severity] || 'bg-gray-100 text-gray-700';
  }

  formatDate(ts: string): string {
    return new Date(ts).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  exportLogs(): void {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Description', 'IP', 'Severity'];
    const rows = this.filteredLogs.map(l =>
      [l.timestamp, l.userEmail, l.userRole, l.action, `"${l.description}"`, l.ipAddress, l.severity].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'audit-logs.csv'; a.click();
    URL.revokeObjectURL(url);
  }
}
