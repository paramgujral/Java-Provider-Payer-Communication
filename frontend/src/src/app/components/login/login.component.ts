
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../services/shared.service';
import { LoginRequest, RoleId, UserRole } from '../../models';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ButtonModule, CardModule]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  selectedRole: 'Provider' | 'Payer' = 'Provider';
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  selectRole(role: 'Provider' | 'Payer'): void {
    this.selectedRole = role;
    this.errorMessage = '';
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly';
      return;
    }

    this.isLoading = true;
    const loginPayload: LoginRequest = {
      roleId: this.selectedRole === 'Provider' ? RoleId.PROVIDER : RoleId.PAYER,
      roleName: this.selectedRole,
      username: this.loginForm.get('username')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.sharedService.login(loginPayload).subscribe(
      // (response) => {
      //   this.isLoading = false;
      //   if (response) {
      //     if (this.selectedRole === 'Provider') {
      //       this.router.navigate(['/dashboard']);
      //     } else {
      //       this.router.navigate(['/home']);
      //     }
      //   }
      // },

    (response) => {
  console.log('Response:', response);

  this.isLoading = false;

  localStorage.setItem('token', response.token);

  if (this.selectedRole === 'Provider') {
    this.router.navigate(['/dashboard'])
      .then(res => console.log('Dashboard Navigation:', res));
  } else {
    this.router.navigate(['/home'])
      .then(res => console.log('Home Navigation:', res));
  }
},
      (error) => {
        this.isLoading = false;
        this.errorMessage = 'Login failed. Please try again.';
        console.error('Login error:', error);
      }
    );
  }

  get usernameControl() {
    return this.loginForm.get('username');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }
}
