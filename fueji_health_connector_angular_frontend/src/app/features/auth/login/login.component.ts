import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex overflow-hidden">

      <!-- ===== LEFT PANEL — desktop only ===== -->
      <div class="hidden lg:flex lg:w-1/2 relative flex-col min-h-screen"
           style="background: linear-gradient(145deg, #0c1a36 0%, #1a3a6e 55%, #1a2866 100%)">

        <!-- Decorative blobs (purely visual, overflow clipped by parent) -->
        <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
             style="background: radial-gradient(circle, rgba(74,144,217,0.25), transparent)"></div>
        <div class="absolute -bottom-32 -left-32 w-80 h-80 rounded-full pointer-events-none"
             style="background: radial-gradient(circle, rgba(108,99,255,0.2), transparent)"></div>

        <!-- Logo -->
        <div class="relative z-10 flex items-center gap-3 px-12 pt-12 shrink-0">
          <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <svg class="w-6 h-6 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <span class="text-xl font-bold text-white tracking-tight">HealthConnector</span>
        </div>

        <!-- Slides area — fixed height, uses opacity transitions -->
        <div class="relative flex-1 overflow-hidden">

          <!-- Slide 0 — Overview -->
          <div class="slide-panel px-12 py-8" [class.slide-visible]="currentSlide === 0" [class.slide-hidden]="currentSlide !== 0">
            <div class="mb-4">
              <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold text-blue-300"
                    style="background: rgba(74,144,217,0.2); border: 1px solid rgba(74,144,217,0.35)">
                AI-Powered Platform
              </span>
            </div>
            <h2 class="text-4xl font-bold text-white leading-tight mb-5">
              Streamline Prior<br>Authorization <span style="color:#64b5f6">Workflows</span>
            </h2>
            <p class="text-blue-200 text-base mb-10 leading-relaxed">
              Connect healthcare providers and payers with intelligent automation for faster, more accurate authorization decisions.
            </p>
            <div class="grid grid-cols-3 gap-5">
              <div class="text-center p-4 rounded-2xl" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)">
                <div class="text-3xl font-extrabold text-white mb-1">40%</div>
                <div class="text-blue-300 text-xs leading-snug">Faster<br>Processing</div>
              </div>
              <div class="text-center p-4 rounded-2xl" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)">
                <div class="text-3xl font-extrabold text-white mb-1">98%</div>
                <div class="text-blue-300 text-xs leading-snug">Accuracy<br>Rate</div>
              </div>
              <div class="text-center p-4 rounded-2xl" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)">
                <div class="text-3xl font-extrabold text-white mb-1">24/7</div>
                <div class="text-blue-300 text-xs leading-snug">Platform<br>Uptime</div>
              </div>
            </div>
          </div>

          <!-- Slide 1 — Features -->
          <div class="slide-panel px-12 py-8" [class.slide-visible]="currentSlide === 1" [class.slide-hidden]="currentSlide !== 1">
            <div class="mb-4">
              <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold text-purple-300"
                    style="background:rgba(108,99,255,0.2);border:1px solid rgba(108,99,255,0.35)">
                Key Features
              </span>
            </div>
            <h2 class="text-4xl font-bold text-white leading-tight mb-5">
              AI-Powered <span style="color:#64b5f6">Clinical</span><br>Intelligence
            </h2>
            <p class="text-blue-200 text-base mb-8 leading-relaxed">
              Our AI Copilot reviews every request, catching issues before they cause costly denials.
            </p>
            <div class="space-y-3">
              <div class="flex items-center gap-4 rounded-2xl p-4" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(72,199,142,0.2)">
                  <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>
                <div>
                  <div class="text-white text-sm font-semibold">Smart Clinical Review</div>
                  <div class="text-blue-300 text-xs mt-0.5">AI analyzes medical necessity in real-time</div>
                </div>
              </div>
              <div class="flex items-center gap-4 rounded-2xl p-4" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(74,144,217,0.2)">
                  <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                </div>
                <div>
                  <div class="text-white text-sm font-semibold">Real-time Communication</div>
                  <div class="text-blue-300 text-xs mt-0.5">Instant bidirectional messaging</div>
                </div>
              </div>
              <div class="flex items-center gap-4 rounded-2xl p-4" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background:rgba(168,85,247,0.2)">
                  <svg class="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                </div>
                <div>
                  <div class="text-white text-sm font-semibold">HIPAA Compliant &amp; Secure</div>
                  <div class="text-blue-300 text-xs mt-0.5">AES-256 encrypted PHI/PII data</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Slide 2 — How It Works -->
          <div class="slide-panel px-12 py-8" [class.slide-visible]="currentSlide === 2" [class.slide-hidden]="currentSlide !== 2">
            <div class="mb-4">
              <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold text-cyan-300"
                    style="background:rgba(0,198,255,0.15);border:1px solid rgba(0,198,255,0.3)">
                FHIR R4 Compliant
              </span>
            </div>
            <h2 class="text-4xl font-bold text-white leading-tight mb-5">
              How It <span style="color:#64b5f6">Works</span>
            </h2>
            <p class="text-blue-200 text-base mb-8 leading-relaxed">
              A seamless four-step workflow connecting providers and payers efficiently.
            </p>
            <div class="space-y-4">
              @for (step of workflowSteps; track step.title; let i = $index) {
              <div class="flex items-start gap-4">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                     style="background:rgba(100,181,246,0.25);border:1px solid rgba(100,181,246,0.4)">
                  {{ i + 1 }}
                </div>
                <div class="flex-1 rounded-xl p-3" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08)">
                  <div class="text-white text-sm font-semibold">{{ step.title }}</div>
                  <div class="text-blue-300 text-xs mt-0.5">{{ step.desc }}</div>
                </div>
              </div>
              }
            </div>
          </div>
        </div>

        <!-- Progress bar + Dots -->
        <div class="relative z-10 px-12 pb-12 shrink-0">
          <!-- Auto-scroll progress bar -->
          <div class="h-0.5 bg-white bg-opacity-20 rounded-full mb-5 overflow-hidden">
            <div class="progress-bar h-full bg-blue-400 rounded-full" [style.animation-play-state]="'running'"></div>
          </div>
          <div class="flex items-center gap-3">
            @for (s of [0,1,2]; track s) {
              <button (click)="goToSlide(s)"
                      class="dot-btn transition-all duration-300"
                      [class.dot-active]="currentSlide === s"
                      [class.dot-inactive]="currentSlide !== s">
              </button>
            }
            <span class="ml-3 text-blue-400 text-xs font-medium">{{ currentSlide + 1 }} / 3</span>
          </div>
        </div>
      </div>

      <!-- ===== RIGHT PANEL — always visible ===== -->
      <div class="w-full lg:w-1/2 flex flex-col">

        <!-- Mobile-only branded header -->
        <div class="lg:hidden relative overflow-hidden shrink-0"
             style="background: linear-gradient(135deg, #0c1a36 0%, #1a3a6e 100%); min-height: 180px">
          <!-- blobs -->
          <div class="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
               style="background:radial-gradient(circle,rgba(74,144,217,0.3),transparent)"></div>
          <div class="absolute -bottom-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
               style="background:radial-gradient(circle,rgba(108,99,255,0.25),transparent)"></div>

          <div class="relative z-10 flex flex-col items-center justify-center py-10 px-6 text-center">
            <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <svg class="w-8 h-8 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-white">HealthConnector</h1>
            <p class="text-blue-200 text-sm mt-1">AI-Powered Prior Authorization Platform</p>
            <!-- Mini feature badges -->
            <div class="flex items-center gap-2 mt-4 flex-wrap justify-center">
              <span class="px-3 py-1 rounded-full text-xs text-blue-100" style="background:rgba(255,255,255,0.12)">FHIR R4</span>
              <span class="px-3 py-1 rounded-full text-xs text-blue-100" style="background:rgba(255,255,255,0.12)">HIPAA Compliant</span>
              <span class="px-3 py-1 rounded-full text-xs text-blue-100" style="background:rgba(255,255,255,0.12)">AI Copilot</span>
            </div>
          </div>
        </div>

        <!-- Form area -->
        <div class="flex-1 flex items-center justify-center bg-white px-6 py-10">
          <div class="w-full max-w-md">

            <!-- Heading -->
            <div class="mb-8">
              <h1 class="text-3xl font-bold text-gray-900">Welcome back</h1>
              <p class="text-gray-500 mt-2">Sign in to your account to continue</p>
            </div>

            <!-- Form -->
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" autocomplete="on" novalidate class="space-y-5">

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div class="relative">
                  <input type="email" id="email" formControlName="email" autocomplete="email"
                         class="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                         placeholder="you@example.com">
                  <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </div>
                @if (email?.invalid && email?.touched) {
                  <p class="text-red-500 text-xs mt-1.5">Please enter a valid email address</p>
                }
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div class="relative">
                  <input [type]="showPassword ? 'text' : 'password'" id="password" formControlName="password" autocomplete="current-password"
                         class="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                         placeholder="••••••••">
                  <button type="button" (click)="togglePassword()" class="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition">
                    @if (!showPassword) {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    } @else {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      </svg>
                    }
                  </button>
                </div>
                @if (password?.invalid && password?.touched) {
                  <p class="text-red-500 text-xs mt-1.5">Password must be at least 6 characters</p>
                }
              </div>

              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" checked>
                  <span class="text-sm text-gray-600">Remember me</span>
                </label>
                <a routerLink="/forgot-password" class="text-sm font-medium text-blue-600 hover:text-blue-800 transition">Forgot password?</a>
              </div>

              @if (errorMessage) {
                <div class="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <svg class="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <span>{{ errorMessage }}</span>
                </div>
              }

              <button type="submit" [disabled]="!loginForm.valid || isLoading"
                      class="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      style="background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)">
                @if (!isLoading) {
                  <span class="flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                    </svg>
                    Sign In to Dashboard
                  </span>
                } @else {
                  <span class="flex items-center justify-center gap-3">
                    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" class="opacity-75"></path>
                    </svg>
                    Signing in...
                  </span>
                }
              </button>
            </form>

            <p class="text-center text-xs text-gray-400 mt-6">
              &copy; 2025 <span class="font-semibold text-gray-500">HealthConnector</span> by Feuji &bull; HIPAA Compliant
            </p>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* === Slide panels: fade + slight vertical drift === */
    .slide-panel {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .slide-visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    .slide-hidden {
      opacity: 0;
      transform: translateY(16px);
      pointer-events: none;
    }

    /* === Auto-scroll progress bar === */
    @keyframes progressBar {
      from { width: 0%; }
      to   { width: 100%; }
    }
    .progress-bar {
      animation: progressBar 4.5s linear infinite;
    }

    /* === Dot navigation === */
    .dot-btn {
      height: 8px;
      border-radius: 4px;
      cursor: pointer;
      border: none;
      outline: none;
      transition: width 0.3s ease, background 0.3s ease;
    }
    .dot-active  { width: 28px; background: #fff; }
    .dot-inactive{ width: 8px;  background: rgba(255,255,255,0.3); }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  currentSlide = 0;
  private slideSub?: Subscription;

  workflowSteps = [
    { title: 'Provider Submits Request', desc: 'Complete clinical documentation with AI Copilot assistance' },
    { title: 'AI Reviews & Scores',      desc: 'Automated clinical validation and risk assessment' },
    { title: 'Payer Makes Decision',     desc: 'Approve, deny, or request additional information' },
    { title: 'Real-time Notification',   desc: 'Instant status updates and immutable audit trail' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.startSlideShow();

    if (this.authService.isLoggedIn()) {
      const role = this.authService.getCurrentUser()?.role;
      if (role === 'SUPER_ADMIN') { this.router.navigate(['/admin/dashboard']); return; }
      if (role === 'PROVIDER')    { this.router.navigate(['/provider/dashboard']); return; }
      if (role === 'PAYER')       { this.router.navigate(['/payer/dashboard']); return; }
    }
  }

  ngOnDestroy(): void { this.stopSlideShow(); }

  private startSlideShow(): void {
    this.slideSub = interval(4500).subscribe(() => {
      this.currentSlide = (this.currentSlide + 1) % 3;
      this.cdr.markForCheck();
    });
  }

  private stopSlideShow(): void {
    this.slideSub?.unsubscribe();
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.stopSlideShow();
    this.startSlideShow();
  }

  togglePassword(): void { this.showPassword = !this.showPassword; }

  get email()    { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).pipe(
      finalize(() => { this.isLoading = false; })
    ).subscribe({
      next: (response) => {
        const role = response.user?.role;
        if      (role === 'SUPER_ADMIN') this.router.navigate(['/admin/dashboard']);
        else if (role === 'PROVIDER')    this.router.navigate(['/provider/dashboard']);
        else if (role === 'PAYER')       this.router.navigate(['/payer/dashboard']);
        else                             this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || error.message || 'Invalid email or password. Please try again.';
      }
    });
  }
}
