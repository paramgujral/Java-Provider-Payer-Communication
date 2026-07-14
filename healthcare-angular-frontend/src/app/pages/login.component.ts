import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
  <div class="container"><div class="card" style="max-width:430px;margin:60px auto">
    <h2>Login</h2>
    <div class="error" *ngIf="error">{{ error }}</div>
    <form [formGroup]="form" (ngSubmit)="login()">
      <label>Username</label><input formControlName="username" placeholder="provider1"><br><br>
      <label>Password</label><input type="password" formControlName="password" placeholder="Password@123"><br><br>
      <button [disabled]="form.invalid">Login</button>
      <a routerLink="/register">Register</a>
    </form>
  </div></div>`
})
export class LoginComponent {
  error = '';
  form = this.fb.group({ username: ['', Validators.required], password: ['', Validators.required] });
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}
  login() {
    if (this.form.invalid) return;
    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => this.error = 'Invalid username or password'
    });
  }
}
