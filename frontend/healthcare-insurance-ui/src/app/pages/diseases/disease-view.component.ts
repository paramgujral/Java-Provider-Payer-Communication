import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DiseaseService, DiseaseDTO } from '../../services/disease.service';

@Component({
  selector: 'app-disease-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <h2>{{ title }}</h2>

      <div *ngIf="loading" class="muted">Loading...</div>

      <div *ngIf="!loading">
        <div *ngIf="!loadFailed; else notFound" class="card">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form" [class.disabled-form]="viewMode">
            <label>
              Disease Code
              <input formControlName="diseaseCode" />
              <span class="error" *ngIf="form.get('diseaseCode')?.touched && form.get('diseaseCode')?.hasError('required')">Disease code is required.</span>
            </label>

            <label>
              Disease Name
              <input formControlName="diseaseName" />
              <span class="error" *ngIf="form.get('diseaseName')?.touched && form.get('diseaseName')?.hasError('required')">Disease name is required.</span>
            </label>

            <label>
              Description
              <textarea formControlName="description" rows="4"></textarea>
            </label>

            <div class="actions">
              <button class="btn" type="submit" [disabled]="form.invalid || saving" *ngIf="!viewMode">
                {{ saving ? 'Saving...' : 'Save' }}
              </button>
              <a class="btn secondary" routerLink="/diseases" [class.disabled]="saving">Back</a>
              <a class="btn secondary" [routerLink]="'/diseases/' + disease?.id + '/edit'" *ngIf="viewMode">Edit</a>
            </div>

            <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
          </form>
        </div>

        <ng-template #notFound>
          <p>Disease not found.</p>
          <a class="btn secondary" routerLink="/diseases">Back to list</a>
        </ng-template>
      </div>
    </section>
  `,
  styles: [
    `
      .page { padding: 16px; }
      .card { background: #fff; border: 1px solid #e6e6ea; border-radius: 10px; padding: 14px; }
      .form { max-width: 560px; display: flex; flex-direction: column; gap: 12px; margin-top: 14px; }
      label { display: flex; flex-direction: column; gap: 6px; font-weight: 600; }
      input, textarea { padding: 10px; border: 1px solid #e3e3e8; border-radius: 8px; font: inherit; }
      textarea { resize: vertical; }
      .actions { display: flex; gap: 10px; margin-top: 6px; align-items: center; flex-wrap: wrap; }
      .btn { padding: 10px 14px; background: #111; color: #fff; border-radius: 8px; border: 0; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
      .btn.secondary { background: #efeff3; color: #111; }
      .btn:disabled, .btn.disabled { opacity: 0.7; cursor: not-allowed; }
      .error { color: #b00020; font-weight: 400; font-size: 0.9rem; }
      .muted { color: #666; margin-top: 8px; }
      .disabled-form { opacity: 0.75; }
    `
  ]
})
export class DiseaseViewComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(DiseaseService);

  loading = true;
  saving = false;
  loadFailed = false;
  errorMessage: string | null = null;
  isEdit = false;
  viewMode = false;
  private id: string | null = null;
  disease: DiseaseDTO | null = null;

  form = this.fb.nonNullable.group({
    diseaseCode: ['', Validators.required],
    diseaseName: ['', Validators.required],
    description: ['']
  });

  get title(): string {
    if (this.viewMode) return 'Disease Details';
    if (this.isEdit) return 'Edit Disease';
    return 'Add Disease';
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    this.viewMode = !!this.id && this.route.snapshot.url.length > 1;

    if (this.viewMode) {
      this.form.disable();
    }

    if (this.id) {
      this.loadDisease(this.id);
    } else {
      this.loading = false;
    }
  }

  private loadDisease(id: string): void {
    this.loading = true;
    this.service.get(id).subscribe({
      next: (d) => {
        this.disease = d;
        this.form.patchValue({
          diseaseCode: d.diseaseCode || '',
          diseaseName: d.diseaseName || '',
          description: d.description || ''
        });

        if (this.viewMode) {
          this.form.disable();
        }

        this.loadFailed = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load disease', err);
        this.loadFailed = true;
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    this.errorMessage = null;

    const payload: DiseaseDTO = {
      id: this.isEdit && this.id ? this.id : undefined,
      diseaseCode: this.form.value.diseaseCode ?? '',
      diseaseName: this.form.value.diseaseName ?? '',
      description: this.form.value.description ?? ''
    };

    this.saving = true;

    const req$ = this.isEdit && this.id
      ? this.service.update(this.id, payload)
      : this.service.create(payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/diseases']);
      },
      error: (err) => {
        console.error('Failed to save disease', err);
        this.errorMessage = 'Failed to save disease.';
        this.saving = false;
      }
    });
  }
}
