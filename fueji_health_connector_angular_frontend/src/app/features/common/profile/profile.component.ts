import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { HeaderComponent } from '../../../shared/components/layout/header/header.component';
import { SidebarComponent } from '../../../shared/components/layout/sidebar/sidebar.component';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-50">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <app-header></app-header>
        <main class="flex-1 overflow-y-auto px-4 md:px-6 py-8">
          <div class="max-w-4xl mx-auto">

            <!-- Page Header -->
            <div class="mb-8">
              <h1 class="text-3xl font-bold text-gray-900">My Profile</h1>
              <p class="text-gray-500 mt-1">Manage your account details and security settings</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <!-- Left: Avatar & Info Card -->
              <div class="lg:col-span-1">
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                  <!-- Avatar -->
                  <div class="relative inline-block mb-4">
                    <div class="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto"
                         style="background: linear-gradient(135deg, #1e88e5, #1565c0)">
                      {{ initials }}
                    </div>
                    <div class="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-green-400 border-2 border-white"></div>
                  </div>

                  <h2 class="text-xl font-bold text-gray-900">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</h2>
                  <p class="text-gray-500 text-sm mt-1">{{ currentUser?.email }}</p>

                  <div class="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                       [ngClass]="getRoleBadgeClass(currentUser?.role)">
                    <span class="w-2 h-2 rounded-full bg-current opacity-70"></span>
                    {{ formatRole(currentUser?.role) }}
                  </div>

                  <!-- Info list -->
                  <div class="mt-6 space-y-3 text-left">
                    @if (currentUser?.mobile) {
                    <div class="flex items-center gap-3 text-sm">
                      <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      <span class="text-gray-700">{{ currentUser?.mobile }}</span>
                    </div>
                    }
                    @if (currentUser?.organizationName) {
                    <div class="flex items-center gap-3 text-sm">
                      <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                      <span class="text-gray-700">{{ currentUser?.organizationName }}</span>
                    </div>
                    }
                    @if (currentUser?.npi) {
                    <div class="flex items-center gap-3 text-sm">
                      <svg class="w-4 h-4 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>
                      <span class="text-gray-700 font-mono">NPI: {{ currentUser?.npi }}</span>
                    </div>
                    }
                    @if (currentUser?.address) {
                    <div class="flex items-start gap-3 text-sm">
                      <svg class="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      <span class="text-gray-700">{{ currentUser?.address }}</span>
                    </div>
                    }
                  </div>

                  <div class="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-400 space-y-1">
                    <p>Member since {{ joinedDate }}</p>
                    <p class="inline-flex items-center gap-1">
                      <svg class="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                      HIPAA Verified Account
                    </p>
                  </div>
                </div>
              </div>

              <!-- Right: Edit Forms -->
              <div class="lg:col-span-2 space-y-6">

                <!-- Profile Info Form -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div class="flex items-center justify-between mb-5">
                    <h3 class="text-base font-bold text-gray-900">Personal Information</h3>
                    @if (!editingProfile) {
                    <button (click)="editingProfile = true"
                            class="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition font-medium">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      Edit
                    </button>
                    }
                  </div>

                  <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1.5">First Name</label>
                        <input formControlName="firstName" type="text"
                               class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition"
                               [class.bg-gray-50]="!editingProfile"
                               [class.focus:ring-2]="editingProfile"
                               [class.focus:ring-blue-500]="editingProfile"
                               [readOnly]="!editingProfile">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1.5">Last Name</label>
                        <input formControlName="lastName" type="text"
                               class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition"
                               [class.bg-gray-50]="!editingProfile"
                               [readOnly]="!editingProfile">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
                        <input formControlName="email" type="email"
                               class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 outline-none" readonly>
                        <p class="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1.5">Mobile Number</label>
                        <input formControlName="mobile" type="tel"
                               class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition"
                               [class.bg-gray-50]="!editingProfile"
                               [readOnly]="!editingProfile">
                      </div>
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-gray-600 mb-1.5">Organization</label>
                        <input formControlName="organizationName" type="text"
                               class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition"
                               [class.bg-gray-50]="!editingProfile"
                               [readOnly]="!editingProfile">
                      </div>
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-gray-600 mb-1.5">Address</label>
                        <input formControlName="address" type="text"
                               class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition"
                               [class.bg-gray-50]="!editingProfile"
                               [readOnly]="!editingProfile">
                      </div>
                    </div>

                    @if (editingProfile) {
                    <div class="flex gap-3">
                      <button type="button" (click)="cancelEdit()" class="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm font-medium">
                        Cancel
                      </button>
                      <button type="submit" class="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium">
                        Save Changes
                      </button>
                    </div>
                    }
                  </form>
                </div>

                <!-- Change Password Form -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 class="text-base font-bold text-gray-900 mb-5">Change Password</h3>
                  <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                    <div class="space-y-4 mb-4">

                      <!-- Current Password -->
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1.5">Current Password</label>
                        <div class="relative">
                          <input formControlName="currentPassword" [type]="showCurrentPw ? 'text' : 'password'"
                                 class="w-full px-3 py-2.5 pr-10 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                 [ngClass]="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched ? 'border-red-400 bg-red-50' : 'border-gray-200'"
                                 placeholder="Enter current password">
                          <button type="button" (click)="showCurrentPw = !showCurrentPw" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              @if (!showCurrentPw) {
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                              } @else {
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                              }
                            </svg>
                          </button>
                        </div>
                        @if (passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched) {
                        <p class="text-red-500 text-xs mt-1">Current password is required</p>
                        }
                      </div>

                      <!-- New Password -->
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1.5">New Password</label>
                        <div class="relative">
                          <input formControlName="newPassword" [type]="showNewPw ? 'text' : 'password'"
                                 class="w-full px-3 py-2.5 pr-10 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                 [ngClass]="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched ? 'border-red-400 bg-red-50' : 'border-gray-200'"
                                 placeholder="Min 8 chars, uppercase, number, symbol">
                          <button type="button" (click)="showNewPw = !showNewPw" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              @if (!showNewPw) {
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                              } @else {
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                              }
                            </svg>
                          </button>
                        </div>

                        <!-- Strength bar -->
                        @if (passwordForm.get('newPassword')?.value) {
                        <div class="mt-2">
                          <div class="flex gap-1 mb-1">
                            @for (s of [1,2,3,4]; track s) {
                            <div class="flex-1 h-1.5 rounded-full transition-all" [ngClass]="getStrengthColor(s)"></div>
                            }
                          </div>
                          <p class="text-xs font-medium" [ngClass]="strengthTextColor">{{ strengthLabel }}</p>
                        </div>
                        }

                        <!-- Policy checklist -->
                        @if (passwordForm.get('newPassword')?.dirty || passwordForm.get('newPassword')?.touched) {
                        <div class="mt-3 bg-gray-50 rounded-lg p-3 space-y-1.5">
                          <p class="text-xs font-semibold text-gray-600 mb-2">Password requirements:</p>
                          @for (rule of passwordRules; track rule.label) {
                          <div class="flex items-center gap-2 text-xs" [ngClass]="rule.met(passwordForm.get('newPassword')?.value || '') ? 'text-green-600' : 'text-gray-400'">
                            <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              @if (rule.met(passwordForm.get('newPassword')?.value || '')) {
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              } @else {
                              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"/>
                              }
                            </svg>
                            {{ rule.label }}
                          </div>
                          }
                        </div>
                        }
                      </div>

                      <!-- Confirm New Password -->
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1.5">Confirm New Password</label>
                        <div class="relative">
                          <input formControlName="confirmPassword" [type]="showConfirmPw ? 'text' : 'password'"
                                 class="w-full px-3 py-2.5 pr-10 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                                 [ngClass]="(passwordForm.get('confirmPassword')?.touched && passwordForm.hasError('mismatch')) ? 'border-red-400 bg-red-50' : (passwordForm.get('confirmPassword')?.touched && !passwordForm.hasError('mismatch') && passwordForm.get('confirmPassword')?.value ? 'border-green-400' : 'border-gray-200')"
                                 placeholder="Re-enter new password">
                          <button type="button" (click)="showConfirmPw = !showConfirmPw" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              @if (!showConfirmPw) {
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                              } @else {
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                              }
                            </svg>
                          </button>
                        </div>
                        @if (passwordForm.get('confirmPassword')?.touched && passwordForm.hasError('mismatch')) {
                        <p class="text-red-500 text-xs mt-1">Passwords do not match</p>
                        }
                        @if (passwordForm.get('confirmPassword')?.touched && !passwordForm.hasError('mismatch') && passwordForm.get('confirmPassword')?.value) {
                        <p class="text-green-600 text-xs mt-1 flex items-center gap-1">
                          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          Passwords match
                        </p>
                        }
                      </div>
                    </div>

                    @if (pwErrorMessage) {
                    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-start gap-2">
                      <svg class="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"/></svg>
                      {{ pwErrorMessage }}
                    </div>
                    }

                    <button type="submit" [disabled]="passwordForm.invalid || pwLoading"
                            class="w-full py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      @if (pwLoading) {
                      <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" class="opacity-75"/>
                      </svg>
                      Updating...
                      } @else {
                      Update Password
                      }
                    </button>
                  </form>
                </div>

                <!-- Security Info -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 class="text-base font-bold text-gray-900 mb-4">Security & Sessions</h3>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div class="flex items-center gap-3">
                        <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                        <div><p class="text-sm font-medium text-gray-900">Current Session</p><p class="text-xs text-gray-500">Active · {{ formatLastLogin() }}</p></div>
                      </div>
                      <span class="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">Active</span>
                    </div>
                    <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div class="flex items-center gap-3">
                        <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                        <div><p class="text-sm font-medium text-gray-900">Two-Factor Authentication</p><p class="text-xs text-gray-500">Not enabled</p></div>
                      </div>
                      <button class="text-xs text-blue-600 font-medium hover:underline">Enable</button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

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
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  editingProfile = false;
  showCurrentPw = false;
  showNewPw = false;
  showConfirmPw = false;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  pwLoading = false;
  pwErrorMessage = '';
  toast: { message: string; type: 'success' | 'error' } | null = null;

  readonly passwordRules: { label: string; met: (v: string) => boolean }[] = [
    { label: 'At least 8 characters',          met: v => v.length >= 8 },
    { label: 'One uppercase letter (A–Z)',      met: v => /[A-Z]/.test(v) },
    { label: 'One lowercase letter (a–z)',      met: v => /[a-z]/.test(v) },
    { label: 'One number (0–9)',                met: v => /[0-9]/.test(v) },
    { label: 'One special character (@$!%*?&)', met: v => /[@$!%*?&_#^]/.test(v) },
  ];

  get initials(): string {
    if (!this.currentUser) return 'U';
    return `${this.currentUser.firstName?.[0] || ''}${this.currentUser.lastName?.[0] || ''}`;
  }

  get joinedDate(): string {
    if (!this.currentUser?.createdAt) return 'Unknown';
    return new Date(this.currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  get strengthScore(): number {
    const pw = this.passwordForm?.get('newPassword')?.value || '';
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  get strengthLabel(): string {
    return ['', 'Weak', 'Fair', 'Good', 'Strong'][this.strengthScore] || '';
  }

  get strengthTextColor(): string {
    return ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600'][this.strengthScore];
  }

  getStrengthColor(level: number): string {
    if (level > this.strengthScore) return 'bg-gray-200';
    return ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][this.strengthScore];
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    this.profileForm = this.fb.group({
      firstName:        [this.currentUser?.firstName || ''],
      lastName:         [this.currentUser?.lastName || ''],
      email:            [{ value: this.currentUser?.email || '', disabled: true }],
      mobile:           [this.currentUser?.mobile || ''],
      organizationName: [this.currentUser?.organizationName || ''],
      address:          [this.currentUser?.address || '']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(g: FormGroup) {
    const pw = g.get('newPassword')?.value;
    const confirm = g.get('confirmPassword')?.value;
    return pw === confirm ? null : { mismatch: true };
  }

  formatRole(role?: string): string {
    const map: Record<string, string> = { SUPER_ADMIN: 'Super Admin', PROVIDER: 'Provider', PAYER: 'Payer' };
    return role ? (map[role] || role) : 'Unknown';
  }

  getRoleBadgeClass(role?: string): string {
    const m: Record<string, string> = { SUPER_ADMIN: 'bg-purple-100 text-purple-700', PROVIDER: 'bg-blue-100 text-blue-700', PAYER: 'bg-green-100 text-green-700' };
    return role ? (m[role] || 'bg-gray-100 text-gray-700') : 'bg-gray-100 text-gray-700';
  }

  formatLastLogin(): string {
    return new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  saveProfile(): void {
    this.editingProfile = false;
    this.showToast('Profile updated successfully.', 'success');
  }

  cancelEdit(): void {
    this.editingProfile = false;
    if (this.currentUser) {
      this.profileForm.patchValue({
        firstName: this.currentUser.firstName,
        lastName:  this.currentUser.lastName,
        mobile:    this.currentUser.mobile || '',
        organizationName: this.currentUser.organizationName || '',
        address:   this.currentUser.address || ''
      });
    }
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.pwLoading = true;
    this.pwErrorMessage = '';
    this.http.post<any>(
      `${environment.apiUrl}/api/auth/change-password`,
      {
        currentPassword: this.passwordForm.value.currentPassword,
        newPassword:     this.passwordForm.value.newPassword,
        confirmPassword: this.passwordForm.value.confirmPassword
      }
    ).pipe(finalize(() => { this.pwLoading = false; this.cdr.detectChanges(); }))
     .subscribe({
       next: () => {
         this.passwordForm.reset();
         this.showToast('Password updated successfully.', 'success');
       },
       error: (err) => {
         this.pwErrorMessage = err?.error?.message ?? 'Failed to update password. Please check your current password.';
       }
     });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => (this.toast = null), 3500);
  }
}
