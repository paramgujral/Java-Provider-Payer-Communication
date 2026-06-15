import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientService, PatientDTO } from '../../services/patient.service';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <h2>{{ isEdit ? 'Edit Patient' : 'Add Patient' }}</h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
        <label>
          Patient Code
          <input formControlName="patientCode" />
        </label>
        <label>
          First Name
          <input formControlName="firstName" />
        </label>
        <label>
          Last Name
          <input formControlName="lastName" />
        </label>
        <label>
          Age
          <input type="number" formControlName="age" />
        </label>
        <label>
          Gender
          <input formControlName="gender" />
        </label>
        <label>
          Phone
          <input formControlName="phone" />
        </label>
        <label>
          Address
          <input formControlName="address" />
        </label>

        <div class="actions">
          <button class="btn" type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Saving...' : 'Save' }}
          </button>
          <a class="btn secondary" routerLink="/patients" [class.disabled]="loading">Cancel</a>
        </div>

        <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
      </form>
    </section>
  `,
  styles: [
    `
      .page { padding: 16px; }
      .form { max-width: 520px; display: flex; flex-direction: column; gap: 12px; margin-top: 14px; }
      label { display: flex; flex-direction: column; gap: 6px; font-weight: 600; }
      input { padding: 10px; border: 1px solid #e3e3e8; border-radius: 8px; }
      .actions { display: flex; gap: 10px; margin-top: 6px; align-items: center; }
      .btn { padding: 10px 14px; background: #111; color: #fff; border-radius: 8px; border: 0; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
      .btn.secondary { background: #efeff3; color: #111; }
      .btn:disabled { opacity: 0.7; cursor: not-allowed; }
      .error { color: #b00020; font-weight: 600; margin-top: 8px; }
    `
  ]
})
export class PatientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private patientService = inject(PatientService);

  loading = false;
  errorMessage: string | null = null;
  isEdit = false;
  private id: string | null = null;

  form = this.fb.nonNullable.group({
    patientCode: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    age: [null as number | null, [Validators.required, Validators.min(0)]],
    gender: ['', Validators.required],
    phone: [''],
    address: ['']
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;

    if (this.isEdit && this.id) {
      this.loading = true;
      this.patientService.get(this.id).subscribe({
        next: (p) => {
          this.form.patchValue({
            patientCode: p.patientCode || '',
            firstName: p.firstName || '',
            lastName: p.lastName || '',
            age: p.age ?? null,
            gender: p.gender || '',
            phone: p.phone || '',
            address: p.address || ''
          });
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load patient', err);
          this.errorMessage = 'Failed to load patient.';
          this.loading = false;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.loading) return;
    this.errorMessage = null;

    const payload: PatientDTO = {
      id: this.isEdit && this.id ? this.id : undefined,
      patientCode: this.form.value.patientCode ?? '',
      firstName: this.form.value.firstName ?? '',
      lastName: this.form.value.lastName ?? '',
      age: this.form.value.age ?? 0,
      gender: this.form.value.gender ?? '',
      phone: this.form.value.phone ?? undefined,
      address: this.form.value.address ?? undefined
    };

    this.loading = true;

    const req$ = this.isEdit && this.id
      ? this.patientService.update(this.id, payload)
      : this.patientService.create(payload);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/patients']);
      },
      error: (err) => {
        console.error('Failed to save patient', err);
        this.errorMessage = 'Failed to save patient.';
        this.loading = false;
      }
    });
  }
}
