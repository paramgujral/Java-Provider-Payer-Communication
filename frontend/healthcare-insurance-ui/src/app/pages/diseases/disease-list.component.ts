import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DiseaseService, DiseaseDTO } from '../../services/disease.service';

@Component({
  selector: 'app-disease-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <h2>Diseases</h2>

      <div class="actions">
        <a class="btn" routerLink="/diseases/new">Add Disease</a>
      </div>

      <table class="table" *ngIf="diseases?.length; else empty">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of diseases">
            <td>{{ d.diseaseCode || '-' }}</td>
            <td>{{ d.diseaseName || '-' }}</td>
            <td class="row-actions">
              <a routerLink="/diseases/{{ d.id }}">View</a>
              <span class="sep">|</span>
              <a routerLink="/diseases/{{ d.id }}/edit">Edit</a>
            </td>
          </tr>
        </tbody>
      </table>

      <ng-template #empty>
        <p>No diseases found.</p>
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
export class DiseaseListComponent implements OnInit {
  private diseaseService = inject(DiseaseService);
  diseases: DiseaseDTO[] = [];

  ngOnInit(): void {
    this.diseaseService.list().subscribe({
      next: (data) => (this.diseases = data),
      error: (err) => {
        console.error('Failed to load diseases', err);
        this.diseases = [];
      }
    });
  }
}
