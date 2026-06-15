import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4">

      <!-- Card -->
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

          @if (!sent) {
          <!-- Request form -->
          <div class="mb-6 text-center">
            <div class="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900">Forgot Password?</h1>
            <p class="text-gray-500 text-sm mt-1">Enter your email and we'll send you a reset link</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div class="relative">
                <input type="email" formControlName="email" autocomplete="email"
                       placeholder="you@example.com"
                       class="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400">
                <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <p class="text-red-500 text-xs mt-1">Please enter a valid email address</p>
              }
            </div>

            @if (errorMessage) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {{ errorMessage }}
            </div>
            }

            <button type="submit" [disabled]="form.invalid || loading"
                    class="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style="background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)">
              @if (loading) {
              <span class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" class="opacity-75"/>
                </svg>
                Sending...
              </span>
              } @else {
              Send Reset Link
              }
            </button>
          </form>
          } @else {
          <!-- Success state -->
          <div class="text-center py-4">
            <div class="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p class="text-gray-500 text-sm leading-relaxed mb-2">
              We've sent a password reset link to
            </p>
            <p class="font-semibold text-blue-600 text-sm mb-4">{{ form.get('email')?.value }}</p>
            <p class="text-gray-400 text-xs leading-relaxed">
              The link expires in 60 minutes. Didn't receive it? Check your spam folder or
              <button (click)="sent = false" class="text-blue-600 hover:underline font-medium">try again</button>.
            </p>
          </div>
          }

          <!-- Back to login -->
          <div class="mt-6 text-center">
            <a routerLink="/login" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Back to Sign In
            </a>
          </div>
        </div>

        <p class="text-center text-xs text-blue-200/50 mt-6">
          &copy; 2025 HealthConnector by Feuji &bull; HIPAA Compliant
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class ForgotPasswordComponent {
  form!: FormGroup;
  loading = false;
  sent = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.http.post<any>(`${environment.apiUrl}/api/auth/forgot-password`, { email: this.form.value.email })
      .pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => { this.sent = true; },
        error: (err) => {
          // Show generic message even on error to avoid email enumeration
          this.sent = true;
        }
      });
  }
}
