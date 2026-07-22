import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionAuthService } from './auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class SignInPageComponent {
  signInForm = this.formBuilder.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading     = false;
  error: string | null = null;
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private sessionAuthService: SessionAuthService,
    private router: Router
  ) {}

  handleSignIn(): void {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error   = null;

    const credentials = this.signInForm.value as { email: string; password: string };

    this.sessionAuthService.authenticateUser(credentials.email, credentials.password).subscribe({
      next: (res) => {
        this.loading = false;
        this.sessionAuthService.persistSession(res);

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
        if (err.status === 401) {
          this.error = 'Invalid email or password';
        } else if (err.status === 403) {
          this.error = 'Login blocked by server. Restart backend and try again.';
        } else {
          this.error = err.error?.diagnostics
            || err.error?.message
            || 'Server error. Please try again.';
        }
      },
    });
  }

  fillDemoCredentials(accountKey: string): void {
    const demoAccounts: Record<string, { email: string; password: string }> = {
      provider1: { email: 'provider@healthconnect.com',  password: 'password123' },
      provider2: { email: 'provider2@healthconnect.com', password: 'password123' },
      payer1:    { email: 'payer@healthconnect.com',     password: 'password123' },
      payer2:    { email: 'payer2@healthconnect.com',    password: 'password123' },
    };

    const selectedAccount = demoAccounts[accountKey];
    if (selectedAccount) {
      this.signInForm.patchValue(selectedAccount);
    }
  }
}
