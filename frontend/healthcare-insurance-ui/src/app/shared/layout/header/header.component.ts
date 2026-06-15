import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <span class="brand">Healthcare Insurance System</span>
      <nav class="nav">
        <a routerLink="/healthcare/dashboard" routerLinkActive="active" class="nav-link">Healthcare</a>
        <a routerLink="/insurance/dashboard" routerLinkActive="active" class="nav-link">Insurance</a>
      </nav>
    </header>
  `,
  styles: [
    `
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 22px;
        background: #fff;
        border-bottom: 1px solid #e5e7eb;
        position: sticky;
        top: 0;
        z-index: 20;
      }
      .brand {
        font-size: 18px;
        font-weight: 800;
        color: #0f172a;
      }
      .nav {
        display: flex;
        gap: 10px;
      }
      .nav-link {
        padding: 8px 12px;
        border-radius: 8px;
        text-decoration: none;
        color: #334155;
        font-weight: 600;
      }
      .nav-link.active {
        background: #eef2ff;
        color: #1e40af;
      }
      @media (max-width: 720px) {
        .nav {
          display: none;
        }
      }
    `
  ]
})
export class HeaderComponent {
  @Output() toggle = new EventEmitter<void>();
}
