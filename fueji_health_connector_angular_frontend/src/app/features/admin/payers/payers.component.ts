import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LayoutModule } from '../../../shared/components/layout/layout.module';
import { environment } from '../../../../environments/environment';

interface Payer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  mobile: string;
  address: string;
  status: 'ACTIVE' | 'PENDING' | 'BLOCKED';
  joinedDate: string;
  pendingReviews: number;
  totalDecisions: number;
  tempPassword?: string;
}

@Component({
  selector: 'app-payers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LayoutModule],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-50">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <app-header></app-header>
        <main class="flex-1 overflow-y-auto p-4 md:p-6">
          <div class="max-w-7xl mx-auto">

            <!-- Page Header -->
            <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Payer Management</h1>
                <p class="text-gray-500 mt-1">Manage insurance payers and their review permissions</p>
              </div>
              <button (click)="openAddModal()"
                      class="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium shadow-sm">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                Add Payer
              </button>
            </div>

            <!-- Stats Row -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <p class="text-xs text-gray-500 font-medium">Total Payers</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{{ payers.length }}</p>
              </div>
              <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <p class="text-xs text-gray-500 font-medium">Active</p>
                <p class="text-2xl font-bold text-green-600 mt-1">{{ countByStatus('ACTIVE') }}</p>
              </div>
              <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <p class="text-xs text-gray-500 font-medium">Pending Reviews</p>
                <p class="text-2xl font-bold text-orange-600 mt-1">{{ totalPendingReviews() }}</p>
              </div>
              <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <p class="text-xs text-gray-500 font-medium">Total Decisions</p>
                <p class="text-2xl font-bold text-blue-600 mt-1">{{ totalDecisions() }}</p>
              </div>
            </div>

            <!-- Search & Filter Bar -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
              <div class="flex-1 relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="text" [(ngModel)]="searchQuery" (input)="applyFilters()"
                       placeholder="Search by name, email or organization..."
                       class="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
              </div>
              <select [(ngModel)]="statusFilter" (change)="applyFilters()"
                      class="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white">
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>

            <!-- Table -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50 border-b border-gray-100">
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700">Payer</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700 hidden md:table-cell">Organization</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700 hidden lg:table-cell">Pending Reviews</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700 hidden lg:table-cell">Total Decisions</th>
                      <th class="text-left px-5 py-3.5 font-semibold text-gray-700">Status</th>
                      <th class="text-right px-5 py-3.5 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    @for (p of filteredPayers; track p.id) {
                    <tr class="hover:bg-gray-50 transition">
                      <td class="px-5 py-4">
                        <div class="flex items-center gap-3">
                          <div class="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm shrink-0">
                            {{ p.firstName[0] }}{{ p.lastName[0] }}
                          </div>
                          <div>
                            <p class="font-medium text-gray-900">{{ p.firstName }} {{ p.lastName }}</p>
                            <p class="text-xs text-gray-500">{{ p.email }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-5 py-4 text-gray-700 hidden md:table-cell">{{ p.organization }}</td>
                      <td class="px-5 py-4 hidden lg:table-cell">
                        @if (p.pendingReviews > 0) {
                        <span class="inline-flex items-center gap-1 text-orange-700">
                          <span class="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
                          {{ p.pendingReviews }}
                        </span>
                        } @else {
                        <span class="text-gray-400">—</span>
                        }
                      </td>
                      <td class="px-5 py-4 text-gray-700 hidden lg:table-cell">{{ p.totalDecisions }}</td>
                      <td class="px-5 py-4">
                        <span class="px-2.5 py-1 text-xs font-semibold rounded-full" [ngClass]="getStatusClass(p.status)">
                          {{ p.status }}
                        </span>
                      </td>
                      <td class="px-5 py-4">
                        <div class="flex items-center justify-end gap-2">
                          <button (click)="openViewModal(p)"
                                  class="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition">
                            View/Edit
                          </button>
                          @if (p.status !== 'ACTIVE') {
                          <button (click)="activatePayer(p.id)"
                                  class="px-3 py-1 text-xs font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition">
                            Activate
                          </button>
                          }
                          @if (p.status !== 'BLOCKED') {
                          <button (click)="blockPayer(p.id)"
                                  class="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition">
                            Block
                          </button>
                          }
                          <button (click)="resetPassword(p.id)"
                                  class="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                            Reset PW
                          </button>
                        </div>
                      </td>
                    </tr>
                    }
                    @if (filteredPayers.length === 0) {
                    <tr>
                      <td colspan="6" class="px-5 py-12 text-center text-gray-400">No payers match your search</td>
                    </tr>
                    }
                  </tbody>
                </table>
              </div>
              <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Showing {{ filteredPayers.length }} of {{ payers.length }} payers</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Add Payer Modal -->
    @if (showAddModal) {
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.5)">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-900">Add New Payer</h3>
          <button (click)="closeAddModal()" class="text-gray-400 hover:text-gray-600 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <form [formGroup]="addForm" (ngSubmit)="submitPayer()" class="px-6 py-5 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input formControlName="firstName" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm" placeholder="Jane">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input formControlName="lastName" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm" placeholder="Doe">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input formControlName="email" type="email" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm" placeholder="jane.doe@insurance.com">
            @if (addForm.get('email')?.invalid && addForm.get('email')?.touched) {
            <p class="text-red-500 text-xs mt-1">Valid email required</p>
            }
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
            <input formControlName="organizationName" type="text" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm" placeholder="BlueCross Insurance">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            <input formControlName="mobile" type="tel" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm" placeholder="+1 555 0000">
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" (click)="closeAddModal()" class="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm">
              Cancel
            </button>
            <button type="submit" [disabled]="addForm.invalid"
                    class="flex-1 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium text-sm disabled:opacity-50">
              Create Payer
            </button>
          </div>
        </form>
      </div>
    </div>
    }

    <!-- View / Edit Payer Modal -->
    @if (viewPayer) {
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.5)">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
              {{ viewPayer.firstName[0] }}{{ viewPayer.lastName[0] }}
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900">{{ viewPayer.firstName }} {{ viewPayer.lastName }}</h3>
              <p class="text-xs text-gray-500">{{ viewPayer.email }}</p>
            </div>
          </div>
          <button (click)="closeViewModal()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="px-6 pt-4 pb-2 flex flex-wrap gap-3">
          <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full" [ngClass]="getStatusClass(viewPayer.status)">
            {{ viewPayer.status }}
          </span>
          <span class="text-xs text-gray-500 flex items-center gap-1">Joined {{ viewPayer.joinedDate }}</span>
          <span class="text-xs text-gray-500">{{ viewPayer.totalDecisions }} decisions</span>
        </div>

        <form [formGroup]="editForm" (ngSubmit)="savePayer()" class="px-6 pb-6 pt-2 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">First Name</label>
              <input formControlName="firstName" type="text"
                     class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
              @if (editForm.get('firstName')?.invalid && editForm.get('firstName')?.touched) {
              <p class="text-red-500 text-xs mt-1">Required (min 2 chars)</p>
              }
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
              <input formControlName="lastName" type="text"
                     class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
            <input type="email" [value]="viewPayer.email" readonly
                   class="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed">
            <p class="text-xs text-gray-400 mt-0.5">Email cannot be changed</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Mobile</label>
            <input formControlName="mobile" type="tel"
                   class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
            @if (editForm.get('mobile')?.invalid && editForm.get('mobile')?.touched) {
            <p class="text-red-500 text-xs mt-1">10–15 digits required</p>
            }
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Organization</label>
            <input formControlName="organizationName" type="text"
                   class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Address</label>
            <input formControlName="address" type="text"
                   class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                   placeholder="Office address">
          </div>

          <!-- Password section -->
          <div class="border-t border-gray-100 pt-4">
            <p class="text-xs font-semibold text-gray-700 mb-3">Account Password</p>
            @if (viewPayer?.tempPassword) {
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
              <div class="flex gap-2 items-center">
                <input [type]="showPayerPw ? 'text' : 'password'" [value]="viewPayer!.tempPassword" readonly
                       class="flex-1 px-3 py-2 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-800 font-mono select-all">
                <button type="button" (click)="showPayerPw = !showPayerPw"
                        class="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition" [title]="showPayerPw ? 'Hide' : 'Reveal'">
                  @if (showPayerPw) {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  } @else {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>
            </div>
            } @else {
            <div class="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-400">
              Password not available for this account.
            </div>
            }
          </div>

          @if (editError) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">{{ editError }}</div>
          }

          <div class="flex gap-3 pt-2">
            <button type="button" (click)="closeViewModal()"
                    class="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium text-sm">
              Cancel
            </button>
            <button type="submit" [disabled]="editForm.invalid || editSaving"
                    class="flex-1 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              @if (editSaving) {
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" class="opacity-75"/></svg>
              Saving...
              } @else {
              Save Changes
              }
            </button>
          </div>
        </form>
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
export class PayersComponent implements OnInit {
  payers: Payer[] = [];
  filteredPayers: Payer[] = [];
  searchQuery = '';
  statusFilter = 'ALL';
  showAddModal = false;
  addForm!: FormGroup;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  viewPayer: Payer | null = null;
  editForm!: FormGroup;
  editSaving = false;
  editError = '';
  pwRevealing = false;
  showPayerPw = false;

  private readonly API_BASE = `${environment.apiUrl}/api`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.addForm = this.fb.group({
      firstName:        ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName:         ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email:            ['', [Validators.required, Validators.email]],
      organizationName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      mobile:           ['', Validators.required]
    });
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.loadPayers(), 0);
    }
  }

  private loadPayers(): void {
    this.http.get<any>(`${this.API_BASE}/payers`).subscribe({
      next: (res) => {
        const list: any[] = res?.data?.content ?? res?.data ?? [];
        this.payers = list.map(p => this.mapUser(p));
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err?.error?.message ?? `Failed to load payers (${err?.status ?? 'network error'})`;
        console.error(msg);
        this.applyFilters();
        this.cdr.detectChanges();
      }
    });
  }

  private mapUser(p: any): Payer {
    return {
      id:             String(p.id ?? p._id ?? ''),
      firstName:      p.firstName ?? '',
      lastName:       p.lastName  ?? '',
      email:          p.email     ?? '',
      organization:   p.organizationName ?? p.organization ?? '',
      mobile:         p.mobile    ?? '',
      address:        p.address   ?? '',
      status:         p.status    ?? 'PENDING',
      joinedDate:     (p.createdAt ?? p.joinedDate ?? '').toString().split('T')[0] || new Date().toISOString().split('T')[0],
      pendingReviews: p.pendingReviews ?? 0,
      totalDecisions: p.totalDecisions ?? 0,
      tempPassword:   p.lastAdminPassword ?? undefined
    };
  }

  openViewModal(p: Payer): void {
    this.viewPayer = p;
    this.editError = '';
    this.editForm = this.fb.group({
      firstName:        [p.firstName,    [Validators.required, Validators.minLength(2)]],
      lastName:         [p.lastName,     [Validators.required, Validators.minLength(2)]],
      mobile:           [p.mobile,       [Validators.required, Validators.pattern(/^[+]?[0-9]{10,15}$/)]],
      organizationName: [p.organization, [Validators.required, Validators.minLength(2)]],
      address:          [p.address || '']
    });
    // Fetch full record to include lastAdminPassword
    this.http.get<any>(`${this.API_BASE}/payers/${p.id}`).subscribe({
      next: (res) => {
        const full = res?.data ?? res;
        this.viewPayer = this.mapUser(full);
        this.cdr.detectChanges();
      }
    });
  }

  closeViewModal(): void {
    this.viewPayer = null;
    this.editError = '';
    this.pwRevealing = false;
    this.showPayerPw = false;
  }

  revealPayerPassword(): void {
    if (!this.viewPayer || this.pwRevealing) return;
    this.pwRevealing = true;
    this.http.post<any>(`${this.API_BASE}/payers/${this.viewPayer.id}/reset-password`, null).subscribe({
      next: (res) => {
        const newPw: string = res?.data ?? '';
        if (this.viewPayer) this.viewPayer.tempPassword = newPw;
        this.pwRevealing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.pwRevealing = false;
        this.editError = err?.error?.message ?? 'Failed to reset password.';
        this.cdr.detectChanges();
      }
    });
  }

  savePayer(): void {
    if (this.editForm.invalid || !this.viewPayer) return;
    this.editSaving = true;
    this.editError = '';
    const v = this.editForm.value;
    this.http.put<any>(`${this.API_BASE}/payers/${this.viewPayer.id}`, {
      firstName:        v.firstName,
      lastName:         v.lastName,
      mobile:           v.mobile,
      organizationName: v.organizationName,
      address:          v.address || undefined
    }).subscribe({
      next: (res) => {
        this.editSaving = false;
        const updated = res?.data ?? res;
        const idx = this.payers.findIndex(x => x.id === this.viewPayer!.id);
        if (idx >= 0) {
          this.payers[idx] = this.mapUser(updated);
          this.applyFilters();
        }
        this.closeViewModal();
        this.showToast('Payer updated successfully.', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.editSaving = false;
        this.editError = err?.error?.message ?? 'Failed to save changes. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredPayers = this.payers.filter(p => {
      const matchQuery = !q ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.organization.toLowerCase().includes(q);
      const matchStatus = this.statusFilter === 'ALL' || p.status === this.statusFilter;
      return matchQuery && matchStatus;
    });
  }

  countByStatus(s: string): number { return this.payers.filter(p => p.status === s).length; }
  totalPendingReviews(): number    { return this.payers.reduce((a, p) => a + p.pendingReviews, 0); }
  totalDecisions(): number         { return this.payers.reduce((a, p) => a + p.totalDecisions, 0); }

  getStatusClass(status: string): string {
    const m: Record<string, string> = { ACTIVE: 'bg-green-100 text-green-700', PENDING: 'bg-yellow-100 text-yellow-700', BLOCKED: 'bg-red-100 text-red-700' };
    return m[status] || 'bg-gray-100 text-gray-700';
  }

  openAddModal():  void { this.showAddModal = true; }
  closeAddModal(): void { this.showAddModal = false; this.addForm.reset(); }

  submitPayer(): void {
    if (this.addForm.invalid) return;
    const v = this.addForm.value;
    const cleanMobile = (v.mobile || '').replace(/[\s\-\(\)]/g, '');
    const payload = {
      firstName:        v.firstName,
      lastName:         v.lastName,
      email:            v.email,
      mobile:           cleanMobile,
      role:             'PAYER',
      organizationName: v.organizationName
    };
    this.http.post<any>(`${this.API_BASE}/payers`, payload).subscribe({
      next: (res) => {
        const p = res?.data ?? res;
        this.payers.unshift(this.mapUser(p));
        this.applyFilters();
        this.closeAddModal();
        this.showToast(`Payer created. A welcome email with login credentials has been sent to ${v.email}.`, 'success');
      },
      error: (err) => {
        const errors: any[] = err?.error?.errors ?? [];
        if (errors.length) {
          const detail = errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
          this.showToast(`Validation error — ${detail}`, 'error');
        } else {
          const msg = err?.error?.message ?? 'Failed to create payer. Please try again.';
          this.showToast(msg, 'error');
        }
      }
    });
  }

  activatePayer(id: string): void {
    this.http.patch<any>(`${this.API_BASE}/payers/${id}/activate`, {}).subscribe({
      next: () => {
        const p = this.payers.find(x => x.id === id);
        if (p) { p.status = 'ACTIVE'; this.applyFilters(); this.cdr.detectChanges(); }
        this.showToast('Payer activated successfully.', 'success');
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to activate payer. Please try again.';
        this.showToast(msg, 'error');
      }
    });
  }

  blockPayer(id: string): void {
    this.http.patch<any>(`${this.API_BASE}/payers/${id}/block`, {}).subscribe({
      next: () => {
        const p = this.payers.find(x => x.id === id);
        if (p) { p.status = 'BLOCKED'; this.applyFilters(); this.cdr.detectChanges(); }
        this.showToast('Payer blocked successfully.', 'success');
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Failed to block payer. Please try again.';
        this.showToast(msg, 'error');
      }
    });
  }

  resetPassword(id: string): void {
    this.http.post<any>(`${this.API_BASE}/payers/${id}/reset-password`, {}).subscribe({
      next: () => this.showToast('Password reset email sent to the payer.', 'success'),
      error: () => this.showToast('Failed to send password reset email.', 'error')
    });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 3500);
  }
}




