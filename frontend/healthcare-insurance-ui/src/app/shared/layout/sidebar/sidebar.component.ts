import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar">
      <div class="brand-mark">HIS</div>
      <ul class="nav">
        <li>
          <a routerLink="/healthcare/dashboard" routerLinkActive="active">
            <span class="material-icons">dashboard</span>
            <span>Healthcare</span>
          </a>
        </li>
        <li>
          <a routerLink="/patients" routerLinkActive="active">
            <span class="material-icons">people</span>
            <span>Patients</span>
          </a>
        </li>
        <li>
          <a routerLink="/diseases" routerLinkActive="active">
            <span class="material-icons">medical_services</span>
            <span>Diseases</span>
          </a>
        </li>
        <li>
          <a routerLink="/policies" routerLinkActive="active">
            <span class="material-icons">policy</span>
            <span>Policies</span>
          </a>
        </li>
        <li>
          <a routerLink="/claims" routerLinkActive="active">
            <span class="material-icons">description</span>
            <span>Claims</span>
          </a>
        </li>
        <li>
          <a routerLink="/insurance/dashboard" routerLinkActive="active">
            <span class="material-icons">account_balance</span>
            <span>Insurance Dashboard</span>
          </a>
        </li>
        <li>
          <a routerLink="/insurance/review" routerLinkActive="active">
            <span class="material-icons">rate_review</span>
            <span>Incoming Claims</span>
          </a>
        </li>
        <li>
          <a routerLink="/insurance/approved" routerLinkActive="active">
            <span class="material-icons">check_circle</span>
            <span>Approved</span>
          </a>
        </li>
        <li>
          <a routerLink="/insurance/rejected" routerLinkActive="active">
            <span class="material-icons">cancel</span>
            <span>Rejected</span>
          </a>
        </li>
      </ul>
    </nav>
  `,
  styles: [
    `
      .sidebar {
        position: sticky;
        top: 57px;
        height: calc(100vh - 57px);
        width: 260px;
        background: #0b1220;
        color: #cbd5e1;
        border-right: 1px solid #111827;
        overflow: auto;
      }
      .brand-mark {
        padding: 16px;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: white;
      }
      .nav {
        list-style: none;
        margin: 0;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .nav a {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        color: inherit;
        text-decoration: none;
        font-weight: 500;
      }
      .nav a.active {
        background: #1f2937;
        color: white;
      }
      .material-icons {
        font-family: 'Material Icons';
        font-size: 18px;
      }
      @media (max-width: 900px) {
        .sidebar {
          display: none;
        }
      }
    `
  ]
})
export class SidebarComponent {}
