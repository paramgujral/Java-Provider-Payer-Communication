import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../core/auth.service';



@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
  <div class="container"><div class="card" style="max-width:430px;margin:60px auto">
    <h2>Register</h2>
    <div class="ok" *ngIf="message">{{ message }}</div>
    <div class="error" *ngIf="error">{{ error }}</div>
    <form [formGroup]="form" (ngSubmit)="register()">
      <label>Username</label><input formControlName="username" placeholder="admin1"><br><br>
      <label>Password</label><input type="password" formControlName="password" placeholder="Password@123"><br><br>
      <label>Role</label>
      <select formControlName="role">
        <option value="ADMIN">ADMIN</option>
        <option value="PROVIDER">PROVIDER</option>
        <option value="PAYER">PAYER</option>
      </select><br><br>
      <button [disabled]="form.invalid">Register</button>
      <a routerLink="/login">Login</a>
    </form>
  </div></div>`
})
export class RegisterComponent {


  message = ''; error = '';
  form = this.fb.group({ username: ['', Validators.required], password: ['', Validators.required], role: ['ADMIN', Validators.required] });
  constructor(private fb: FormBuilder, private auth: AuthService) {}
  register() {
    if (this.form.invalid) return;
    this.auth.register(this.form.value).subscribe({
        next: (res: any) => {
  this.message = res;
  this.error = '';
},
      error: () => { this.error = 'Registration failed'; this.message = ''; }
    });
  }
}
