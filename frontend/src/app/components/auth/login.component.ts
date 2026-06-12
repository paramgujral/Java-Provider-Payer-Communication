import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">🏥</div>
          <h1>HealthConnect<span class="ai">AI</span></h1>
          <p>FHIR R4 Authorization Workflow Platform</p>
        </div>

        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="form-group">
            <label>Username</label>
            <input type="text" [(ngModel)]="username" name="username" placeholder="Enter username" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Enter password" required>
          </div>

          <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>

          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center" [disabled]="loading">
            <span *ngIf="loading" class="spinner" style="width:14px;height:14px;border-width:2px;"></span>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="demo-creds">
          <p class="demo-title">Demo Credentials</p>
          <div class="creds-grid">
            <div class="cred-item" (click)="fillCreds('provider1','password123')">
              <span class="cred-role provider">Provider</span>
              <span>provider1 / password123</span>
            </div>
            <div class="cred-item" (click)="fillCreds('payer1','password123')">
              <span class="cred-role payer">Payer</span>
              <span>payer1 / password123</span>
            </div>
            <div class="cred-item" (click)="fillCreds('admin','admin123')">
              <span class="cred-role admin">Admin</span>
              <span>admin / admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: radial-gradient(ellipse at top, #1a2332 0%, var(--bg-primary) 60%);
    }
    .login-card {
      width: 400px; background: var(--bg-card);
      border: 1px solid var(--border-color); border-radius: var(--radius-xl);
      padding: 40px; box-shadow: var(--shadow-lg);
    }
    .login-header { text-align: center; margin-bottom: 28px;
      .login-logo { font-size: 40px; margin-bottom: 8px; }
      h1 { margin: 0 0 6px; font-size: 22px; font-weight: 700; color: var(--text-primary);
        .ai { color: var(--accent-blue); }
      }
      p { margin: 0; font-size: 12px; color: var(--text-muted); }
    }
    .login-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
    .error-msg { background: rgba(248,81,73,0.1); border: 1px solid rgba(248,81,73,0.3); color: var(--accent-red); padding: 8px 12px; border-radius: var(--radius-md); font-size: 13px; }
    .demo-creds { border-top: 1px solid var(--border-color); padding-top: 20px;
      .demo-title { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px; }
    }
    .creds-grid { display: flex; flex-direction: column; gap: 6px; }
    .cred-item {
      display: flex; align-items: center; gap: 10px; padding: 8px 12px;
      background: var(--bg-tertiary); border-radius: var(--radius-md);
      cursor: pointer; font-size: 12px; color: var(--text-secondary);
      transition: all 0.15s;
      &:hover { background: var(--bg-secondary); color: var(--text-primary); }
    }
    .cred-role { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 10px;
      &.provider { background: rgba(88,166,255,0.15); color: var(--accent-blue); }
      &.payer    { background: rgba(63,185,80,0.15);  color: var(--accent-green); }
      &.admin    { background: rgba(188,140,255,0.15); color: var(--accent-purple); }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  fillCreds(u: string, p: string): void {
    this.username = u; this.password = p;
  }

  onLogin(): void {
    if (!this.username || !this.password) return;
    this.loading = true; this.errorMsg = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.role === 'PROVIDER' || res.role === 'ADMIN') {
          this.router.navigate(['/provider/dashboard']);
        } else {
          this.router.navigate(['/payer/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.error || 'Login failed. Please check credentials.';
      }
    });
  }
}
