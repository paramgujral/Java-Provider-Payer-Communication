import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading     = false;
  error: string | null = null;
  hidePassword = true;

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    this.error   = null;

    const { email, password } = this.form.value as { email: string; password: string };

    this.auth.login(email, password).subscribe({
      next: (res) => {
        this.loading = false;
        this.auth.storeToken(res);           // stores token + role + userId + fullName

        const role = res.role.toUpperCase();

        if (role === 'PAYER') {
          this.router.navigate(['/payer']);
        } else if (role === 'ADMIN' || role === 'MANAGER') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/provider']);
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401 || err.status === 403) {
          this.error = 'Invalid email or password';
        } else {
          this.error = err.error?.message || 'Server error. Please try again.';
        }
      },
    });
  }

  quickLogin(role: string): void {
  const accounts: Record<string, { email: string; password: string }> = {
    provider1: { email: 'provider@healthconnect.com',  password: 'password123' },
    provider2: { email: 'provider2@healthconnect.com', password: 'password123' },
    payer1:    { email: 'payer@healthconnect.com',     password: 'password123' },
    payer2:    { email: 'payer2@healthconnect.com',    password: 'password123' },
  };
  const acc = accounts[role];
  if (acc) {
    this.form.patchValue(acc);
  }
}
}
