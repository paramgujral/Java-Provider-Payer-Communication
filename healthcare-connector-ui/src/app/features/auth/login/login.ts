import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {

    const payload = {
      username: this.username,
      password: this.password
    };

    this.authService.login(payload)
      .subscribe({
        next: (response) => {

          localStorage.setItem(
            'token',
            response.data.accessToken
          );

          localStorage.setItem(
            'role',
            response.data.role
          );

          localStorage.setItem(
            'username',
            response.data.username
          );

          this.router.navigate(['/dashboard']);
        },

        error: () => {
          alert('Invalid Username or Password');
        }
      });
  }
}