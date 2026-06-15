import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        const role = res.role.toLowerCase();
        if (role === 'provider') {
          this.router.navigate(['/provider/dashboard']);
        } else if (role === 'payer') {
          this.router.navigate(['/payer/dashboard']);
        } else if (role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        const errorBody = err.error;
        if (errorBody && errorBody.error === 'ACCOUNT_NOT_ACTIVATED') {
          this.error = errorBody.message;
        } else if (errorBody && errorBody.error === 'BAD_CREDENTIALS') {
          this.error = errorBody.message;
        } else {
          this.error = 'An unexpected error occurred. Please try again later.';
        }
      }
    });
  }
}
