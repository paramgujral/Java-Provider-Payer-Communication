import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService, UserSession } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  usePreset(email: string) {
    this.email = email;
    this.password = 'password';
    this.onSubmit();
  }

  onSubmit() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set(null);

    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (user: UserSession) => {
        this.auth.setSession(user);
        this.router.navigate(['/dashboard']);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error || 'Invalid credentials. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
