import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InsuranceCompanyService, InsuranceCompanyDTO } from '../../services/insurance-company.service';

@Component({
  selector: 'app-insurance-company-view',
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
              Company Name
              <input formControlName="companyName" />
              <span class="error" *ngIf="form.get('companyName')?.touched && form.get('companyName')?.hasError('required')">Company name is required.</span>
            </label>

            <label>
              Email
              <input type="email" formControlName="email" />
              <span class="error" *ngIf="form.get('email')?.touched && form.get('email')?.hasError('email')">Enter a valid email address.</span>
            </label>

            <label>
              Phone
              <input formControlName="phone" />
            </label>

            <label>
              Address
              <textarea formControlName="address" rows="4"></textarea>
            </label>

            <label class="checkbox-label">
              <input type="checkbox" formControlName="active" />
              Active
            </label>

            <div class="actions">
              <button class="btn" type="submit" [disabled]="form.invalid || saving" *ngIf="!viewMode">
                {{ saving ? 'Saving...' : 'Save' }}
              </button>
              <a class="btn secondary" routerLink="/insurance/companies" [class.disabled]="saving">Back</a>
              <a class="btn secondary" [routerLink]="'/insurance/companies/' + company?.id + '/edit'" *ngIf="viewMode">Edit</a>
            </div>

            <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
          </form>
        </div>

        <ng-template #notFound>
          <p>Company not found.</p>
          <a class="btn secondary" routerLink="/insurance/companies">Back to list</a>
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
      .checkbox-label { flex-direction: row; align-items: center; }
      .checkbox-label input { width: auto; }
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
export class InsuranceCompanyViewComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(InsuranceCompanyService);

  loading = true;
  saving = false;
  loadFailed = false;
  errorMessage: string | null = null;
  isEdit = false;
  viewMode = false;
  private id: string | null = null;
  company: InsuranceCompanyDTO | null = null;

  form = this.fb.nonNullable.group({
    companyName: ['', Validators.required],
    email: ['', Validators.email],
    phone: [''],
    address: [''],
    active: [true]
  });

  get title(): string {
    if (this.viewMode) return 'Insurance Company Details';
    if (this.isEdit) return 'Edit Insurance Company';
    return 'Add Insurance Company';
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    this.viewMode = !!this.id && this.route.snapshot.url.length > 1;

    if (this.viewMode) {
      this.form.disable();
    }

    if (this.id) {
      this.loadCompany(this.id);
    } else {
      this.loading = false;
    }
  }

  private loadCompany(id: string): void {
    this.loading = true;
    this.service.get(id).subscribe({
      next: (c) => {
        this.company = c;
        this.form.patchValue({
          companyName: c.companyName || '',
          email: c.email || '',
          phone: c.phone || '',
          address: c.address || '',
          active: c.active ?? true
        });

        if (this.viewMode) {
          this.form.disable();
        }

        this.loadFailed = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load insurance company', err);
        this.loadFailed = true;
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving) return;
    this.errorMessage = null;

    const payload: InsuranceCompanyDTO = {
      id: this.isEdit && this.id ? this.id : undefined,
      companyName: this.form.value.companyName ?? '',
      email: this.form.value.email || undefined,
      phone: this.form.value.phone ?? '',
      address: this.form.value.address ?? '',
      active: this.form.value.active
    };

    this.saving = true;

    const req$ = this.isEdit && this.id
      ? this.service.update(this.id, payload)
      : this.service.create(payload);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/insurance/companies']);
      },
      error: (err) => {
        console.error('Failed to save insurance company', err);
        this.errorMessage = 'Failed to save insurance company.';
        this.saving = false;
      }
    });
  }
}
