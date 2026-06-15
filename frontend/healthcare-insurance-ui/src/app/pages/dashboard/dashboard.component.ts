import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <h1>Dashboard</h1>

      <div class="grid">
        <a class="card" routerLink="/patients">Patients</a>
        <a class="card" routerLink="/diseases">Diseases</a>
        <a class="card" routerLink="/insurance/companies">Insurance Companies</a>
        <a class="card" routerLink="/claims">Claims</a>
        <a class="card" routerLink="/insurance/incoming-claims">Incoming Claims</a>
      </div>
    </section>
  `,
  styles: [
    `
      .page { padding: 16px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 12px; }
      .card { background: #f5f5f7; padding: 14px; border-radius: 10px; text-decoration: none; color: #111; font-weight: 600; }
      .card:hover { background: #ececf2; }
    `
  ]
})
export class DashboardComponent {}
