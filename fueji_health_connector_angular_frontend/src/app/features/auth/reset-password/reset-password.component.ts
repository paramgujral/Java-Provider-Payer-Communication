import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 px-4">

      <div class="w-full max-w-md">

        <!-- Logo -->
        <div class="flex items-center justify-center gap-3 mb-8">
          <div class="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <svg class="w-6 h-6 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <span class="text-xl font-bold text-white">HealthConnector</span>
        </div>

        <div class="bg-white rounded-2xl shadow-2xl p-8">

          @if (!token) {
          <!-- No token in URL -->
          <div class="text-center py-4">
            <div class="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
            <p class="text-gray-500 text-sm mb-4">This link is invalid or has expired. Please request a new one.</p>
            <a routerLink="/forgot-password"
               class="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
              Request New Link
            </a>
          </div>
          } @else if (!success) {
          <!-- Reset form -->
          <div class="mb-6 text-center">
            <div class="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900">Set New Password</h1>
            <p class="text-gray-500 text-sm mt-1">Must be at least 8 characters</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-4">

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div class="relative">
                <input [type]="showNew ? 'text' : 'password'" formControlName="newPassword"
                       placeholder="Min. 8 characters"
                       class="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400">
                <button type="button" (click)="showNew = !showNew"
                        class="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          [attr.d]="showNew ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' : 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'"/>
                  </svg>
                </button>
              </div>
              @if (form.get('newPassword')?.invalid && form.get('newPassword')?.touched) {
              <p class="text-red-500 text-xs mt-1">Password must be at least 8 characters</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div class="relative">
                <input [type]="showConfirm ? 'text' : 'password'" formControlName="confirmPassword"
                       placeholder="Re-enter new password"
                       class="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400">
                <button type="button" (click)="showConfirm = !showConfirm"
                        class="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          [attr.d]="showConfirm ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' : 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'"/>
                  </svg>
                </button>
              </div>
              @if (passwordMismatch) {
              <p class="text-red-500 text-xs mt-1">Passwords do not match</p>
              }
            </div>

            <!-- Password strength indicator -->
            @if (form.get('newPassword')?.value) {
            <div>
              <div class="flex gap-1 mb-1">
                @for (s of [1,2,3,4]; track s) {
                <div class="flex-1 h-1 rounded-full transition-all"
                     [ngClass]="passwordStrength >= s ? strengthColor : 'bg-gray-200'"></div>
                }
              </div>
              <p class="text-xs" [ngClass]="strengthColor.replace('bg-', 'text-')">{{ strengthLabel }}</p>
            </div>
            }

            @if (errorMessage) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {{ errorMessage }}
            </div>
            }

            <button type="submit" [disabled]="form.invalid || loading || passwordMismatch"
                    class="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style="background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)">
              @if (loading) {
              <span class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" class="opacity-75"/>
                </svg>
                Resetting...
              </span>
              } @else {
              Reset Password
              }
            </button>
          </form>
          } @else {
          <!-- Success state -->
          <div class="text-center py-4">
            <div class="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-9 h-9 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-900 mb-2">Password Reset!</h2>
            <p class="text-gray-500 text-sm mb-5">Your password has been updated successfully. You can now sign in with your new password.</p>
            <a routerLink="/login"
               class="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
              Go to Sign In
            </a>
          </div>
          }

          @if (!success) {
          <div class="mt-6 text-center">
            <a routerLink="/login" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Back to Sign In
            </a>
          </div>
          }
        </div>

        <p class="text-center text-xs text-blue-200/50 mt-6">
          &copy; 2025 HealthConnector by Feuji &bull; HIPAA Compliant
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;
  token = '';
  loading = false;
  success = false;
  errorMessage = '';
  showNew = false;
  showConfirm = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.form = this.fb.group({
      newPassword:     ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  get passwordMismatch(): boolean {
    const np = this.form.get('newPassword')?.value;
    const cp = this.form.get('confirmPassword')?.value;
    return !!(np && cp && np !== cp);
  }

  get passwordStrength(): number {
    const p = this.form.get('newPassword')?.value ?? '';
    let score = 0;
    if (p.length >= 8)  score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }

  get strengthColor(): string {
    const s = this.passwordStrength;
    if (s <= 1) return 'bg-red-500';
    if (s === 2) return 'bg-yellow-400';
    if (s === 3) return 'bg-blue-500';
    return 'bg-green-500';
  }

  get strengthLabel(): string {
    const s = this.passwordStrength;
    if (s <= 1) return 'Weak';
    if (s === 2) return 'Fair';
    if (s === 3) return 'Good';
    return 'Strong';
  }

  onSubmit(): void {
    if (this.form.invalid || this.passwordMismatch) return;
    this.loading = true;
    this.errorMessage = '';
    this.http.post<any>(`${environment.apiUrl}/api/auth/reset-password`, {
      token:           this.token,
      newPassword:     this.form.value.newPassword,
      confirmPassword: this.form.value.confirmPassword
    }).pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => { this.success = true; },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? 'Reset failed. The link may have expired.';
        }
      });
  }
}
