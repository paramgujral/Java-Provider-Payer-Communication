import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatientService, PatientDTO } from '../../services/patient.service';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <h2>Patients</h2>

      <div class="actions">
        <a class="btn" routerLink="/patients/new">Add Patient</a>
      </div>

      <table class="table" *ngIf="patients?.length; else empty">
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of patients">
            <td>{{ p.firstName }} {{ p.lastName }}</td>
            <td>{{ p.age ?? '-' }}</td>
            <td>{{ p.gender || '-' }}</td>
            <td class="row-actions">
              <a routerLink="/patients/{{ p.id }}">View</a>
              <span class="sep">|</span>
              <a routerLink="/patients/{{ p.id }}/edit">Edit</a>
            </td>
          </tr>
        </tbody>
      </table>

      <ng-template #empty>
        <p>No patients found.</p>
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
export class PatientListComponent implements OnInit {
  private patientService = inject(PatientService);
  patients: PatientDTO[] = [];

  ngOnInit(): void {
    this.patientService.list().subscribe({
      next: (data) => (this.patients = data),
      error: (err) => {
        console.error('Failed to load patients', err);
        this.patients = [];
      }
    });
  }
}
