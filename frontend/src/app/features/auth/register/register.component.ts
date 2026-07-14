import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  otpForm!: FormGroup;
  isLoading = false;
  isOtpMode = false;
  hidePassword = true;
  errorMessage = '';
  successMessage = '';
  
  // OTP countdown timer (10 mins = 600s)
  otpTimer = 600;
  private timerInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.redirectUser();
      return;
    }

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['PROVIDER', [Validators.required]],
      organizationName: ['', [Validators.required]],
      providerType: ['General Hospital', [Validators.required]],
      phone: ['', [Validators.required]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  ngOnDestroy(): void {
    this.clearInterval();
  }

  onRoleChange(): void {
    const role = this.registerForm.get('role')?.value;
    const providerTypeControl = this.registerForm.get('providerType');
    
    if (role === 'PROVIDER') {
      providerTypeControl?.setValidators([Validators.required]);
      providerTypeControl?.setValue('General Hospital');
    } else {
      providerTypeControl?.clearValidators();
      providerTypeControl?.setValue('');
    }
    providerTypeControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.isOtpMode = true;
          this.startOtpTimer();
        } else {
          this.errorMessage = res.message || 'Registration failed.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Error occurred during registration. Email may be already taken.';
      }
    });
  }

  onVerifyOtp(): void {
    if (this.otpForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      email: this.registerForm.get('email')?.value,
      otp: this.otpForm.get('otp')?.value
    };

    this.authService.verifyOtp(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.clearInterval();
          this.redirectUser();
        } else {
          this.errorMessage = res.message || 'OTP verification failed.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid OTP code. Please verify and try again.';
      }
    });
  }

  onResendOtp(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    const email = this.registerForm.get('email')?.value;

    this.authService.resendOtp(email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'A new 6-digit OTP code has been sent to your email.';
        this.startOtpTimer(); // Reset timer
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to resend OTP. Please try again.';
      }
    });
  }

  // Timer helpers
  private startOtpTimer(): void {
    this.clearInterval();
    this.otpTimer = 600;
    this.timerInterval = setInterval(() => {
      if (this.otpTimer > 0) {
        this.otpTimer--;
      } else {
        this.clearInterval();
      }
    }, 1000);
  }

  private clearInterval(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private redirectUser(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      if (user.role === 'PROVIDER') {
        this.router.navigate(['/provider/dashboard']);
      } else if (user.role === 'PAYER') {
        this.router.navigate(['/payer/dashboard']);
      }
    }
  }
}
