import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PatientService, PatientDTO } from '../../services/patient.service';

@Component({
  selector: 'app-patient-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <h2>Patient Details</h2>
      <div *ngIf="loading" class="muted">Loading...</div>
      <div *ngIf="!loading">
        <div *ngIf="patient; else notFound" class="card">
          <div class="row"><strong>ID:</strong> {{ patient.id }}</div>
          <div class="row"><strong>Name:</strong> {{ patient.firstName }} {{ patient.lastName }}</div>
          <div class="row"><strong>Age:</strong> {{ patient.age ?? '-' }}</div>
          <div class="row"><strong>Gender:</strong> {{ patient.gender || '-' }}</div>
          <div class="row"><strong>Phone:</strong> {{ patient.phone || '-' }}</div>
          <div class="row"><strong>Address:</strong> {{ patient.address || '-' }}</div>
          <div class="actions">
            <a class="btn" routerLink="/patients">Back</a>
            <a class="btn" routerLink="/patients/{{ patient.id }}/edit">Edit</a>
          </div>
        </div>
        <ng-template #notFound>
          <p>Patient not found.</p>
          <a routerLink="/patients">Back to list</a>
        </ng-template>
      </div>
    </section>
  `,
  styles: [
    `
      .page { padding: 16px; }
      .card { background: #fff; border: 1px solid #e6e6ea; border-radius: 10px; padding: 14px; }
      .row { margin: 8px 0; }
      .actions { margin-top: 14px; display: flex; gap: 10px; }
      .btn { padding: 8px 12px; background: #111; color: #fff; border-radius: 8px; text-decoration: none; }
      .muted { color: #666; margin-top: 8px; }
    `
  ]
})
export class PatientViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private patientService = inject(PatientService);

  loading = true;
  patient: PatientDTO | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.patient = null;
      this.loading = false;
      return;
    }
    this.patientService.get(id).subscribe({
      next: (p) => { this.patient = p; this.loading = false; },
      error: (err) => { console.error('Failed to load patient', err); this.patient = null; this.loading = false; }
    });
  }
}
