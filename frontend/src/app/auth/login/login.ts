import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { LoginResponse } from '../../core/models/login-response';
import { AuthenticationService } from '../../core/services/authentication';
import { TokenStorageService } from '../../core/services/token-storage';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  loginForm: FormGroup;

  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {

    this.loginForm = this.fb.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ]

    });

  }

  login() {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: LoginResponse) => {
        this.tokenStorage.saveToken(response.token);
        this.tokenStorage.saveUser(response);

        switch (response.role) {
          case 'PROVIDER':
            this.router.navigate(['/provider/dashboard']);
            break;
          case 'PAYER':
            this.router.navigate(['/payer/dashboard']);
            break;
          case 'ADMIN':
            this.router.navigate(['/admin/dashboard']);
            break;
        }
      },
      error: (error: unknown) => {
        console.log(error);
        alert('Invalid Credentials');
      }
    });

  }

}