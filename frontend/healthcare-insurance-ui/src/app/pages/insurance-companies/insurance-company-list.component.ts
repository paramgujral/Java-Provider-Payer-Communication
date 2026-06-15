import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InsuranceCompanyService, InsuranceCompanyDTO } from '../../services/insurance-company.service';

@Component({
  selector: 'app-insurance-company-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <h2>Insurance Companies</h2>

      <div class="actions">
        <a class="btn" routerLink="/insurance/companies/new">Add Company</a>
      </div>

      <table class="table" *ngIf="companies?.length; else empty">
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of companies">
            <td>{{ c.companyName || '-' }}</td>
            <td>{{ c.address || '-' }}</td>
            <td class="row-actions">
              <a routerLink="/insurance/companies/{{ c.id }}">View</a>
              <span class="sep">|</span>
              <a routerLink="/insurance/companies/{{ c.id }}/edit">Edit</a>
            </td>
          </tr>
        </tbody>
      </table>

      <ng-template #empty>
        <p>No companies found.</p>
      </ng-template>
    </section>
  `,
  styles: [
    `
      .page { padding: 16px; }
      .actions { margin: 12px 0; }
      .btn { display: inline-block; padding: 8px 12px; background: #111; color: #fff; border-radius: 8px; text-decoration: none; }
      .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { text-align: left; padding: 10px; border-bottom: 1px solid #e5e5e8; }
      .row-actions a { color: #1a73e8; text-decoration: none; }
      .sep { margin: 0 8px; color: #999; }
    `
  ]
})
export class InsuranceCompanyListComponent implements OnInit {
  private service = inject(InsuranceCompanyService);
  companies: InsuranceCompanyDTO[] = [];

  ngOnInit(): void {
    this.service.list().subscribe({
      next: (data) => (this.companies = data),
      error: (err) => {
        console.error('Failed to load insurance companies', err);
        this.companies = [];
      }
    });
  }
}
