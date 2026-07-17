import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {

  username: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  login() {

    const loginData = {
      username: this.username,
      password: this.password
    };

    this.authService.login(loginData).subscribe({

      next: (response) => {

        console.log(response);

        // Store token in browser
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('role', response.role);

        // Navigate based on role
        if (response.role === 'PROVIDER') {
          this.router.navigate(['/provider-dashboard']);
        }
        else if (response.role === 'PAYER') {
          this.router.navigate(['/payer-dashboard']);
        }
      },

      error: (error) => {
        console.log(error);
        alert('Invalid username or password');
      }
    });
  }
}