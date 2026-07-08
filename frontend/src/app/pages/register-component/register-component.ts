import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-component.html'
})
export class RegisterComponent {
  username = '';
  password = '';
  role = 'PROVIDER';
  entityId = 1;
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.auth.register({
      username: this.username,
      password: this.password,
      role: this.role,
      entityId: this.entityId
    }).subscribe({
      next: () => {
        this.loading = false;
        alert('Registration successful! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Registration failed';
      }
    });
  }
}