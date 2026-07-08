import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.auth.login(this.username, this.password).subscribe({
      next: user => {
        this.loading = false;
        if (user.role === 'PROVIDER') {
          this.router.navigate(['/provider/form']);
        } else {
          this.router.navigate(['/payer/dashboard']);
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Invalid credentials. Please try again.';
      }
    });
  }
}
