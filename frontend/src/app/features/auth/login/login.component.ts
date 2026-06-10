import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form!: FormGroup;

  error = signal('');
  loading = signal(false);
  showPassword = signal(false);

  readonly demoUsers = [
    {
      label: 'Provider (Dr. Mitchell)',
      email: 'provider@healthconnect.com',
      role: 'PROVIDER'
    },
    {
      label: 'Provider (Dr. Carter)',
      email: 'provider2@healthconnect.com',
      role: 'PROVIDER'
    },
    {
      label: 'Payer (Lisa Johnson)',
      email: 'payer@healthconnect.com',
      role: 'PAYER'
    },
    {
      label: 'Payer (Robert Kim)',
      email: 'payer2@healthconnect.com',
      role: 'PAYER'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    const reason =
      this.route.snapshot.queryParamMap.get('reason');

    if (reason === 'session_expired') {
      this.error.set(
        'Your session has expired. Please log in again.'
      );
    }
  }

  fillDemo(email: string): void {
    this.form.patchValue({
      email,
      password: 'password123'
    });

    this.error.set('');
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.error?.error ||
          'Invalid email or password. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  get email() {
    return this.form.get('email')!;
  }

  get password() {
    return this.form.get('password')!;
  }
}