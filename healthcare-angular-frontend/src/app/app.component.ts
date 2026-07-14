import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="nav">
      <b routerLink="/dashboard" style="cursor:pointer">Healthcare Connector</b>
      <div *ngIf="auth.isLoggedIn()">
        <a routerLink="/dashboard">Dashboard</a>
        <a routerLink="/providers">Providers</a>
        <a routerLink="/payers">Payers</a>
        <a routerLink="/authorizations">Authorization</a>
        <a routerLink="/ai-review">AI Review</a>
        <a routerLink="/notifications">Notifications</a>
      </div>
      <div>
        <span *ngIf="auth.isLoggedIn()">{{ auth.username() }} | {{ auth.role() }}</span>
        <a *ngIf="!auth.isLoggedIn()" routerLink="/login">Login</a>
        <a *ngIf="!auth.isLoggedIn()" routerLink="/register">Register</a>
        <button *ngIf="auth.isLoggedIn()" class="danger" (click)="logout()">Logout</button>
      </div>
    </div>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}
  logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
