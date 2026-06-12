import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component, inject, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef, PLATFORM_ID, NgZone
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AuthRequestResponse,
  ProviderService,
  SuggestionPayload
} from './provider.service';

@Component({
  selector: 'app-provider',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './provider.html',
  styleUrl: './provider.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Provider implements OnInit {

  private fb              = inject(FormBuilder);
  private providerService = inject(ProviderService);
  private cdr             = inject(ChangeDetectorRef);
  private platformId      = inject(PLATFORM_ID);
  private ngZone          = inject(NgZone);

  requests: AuthRequestResponse[] = [];
  loading        = false;
  submitting     = false;
  successMessage = '';
  errorMessage   = '';
  showForm       = true;

  fieldSuggestions: Record<string, string>  = {};
  fieldLoading:     Record<string, boolean> = {};
  fieldErrors:      Record<string, string>  = {};
  fieldChips:       Record<string, string[]> = {};

  // Track pending request per field so we can mark stale ones
  private pendingField: string | null = null;

  providerForm = this.fb.group({
    patientName:          ['', [Validators.required, Validators.minLength(2)]],
    patientId:            ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{4,12}$/i)]],
    insuranceId:          ['', [Validators.required, Validators.pattern(/^[A-Z0-9\-]{5,20}$/i)]],
    diagnosisCode:        ['', [Validators.required, Validators.pattern(/^[A-Z][0-9]{2}(\.[0-9]{1,4})?$/i)]],
    procedureCode:        ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
    treatmentDescription: ['', [Validators.required, Validators.minLength(20)]],
    admissionDate:        ['', Validators.required],
    expectedDischargeDate:[''],
    priority:             ['NORMAL', Validators.required],
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadRequests();
    }
  }
loadRequests(): void {
  if (!isPlatformBrowser(this.platformId)) return;
  this.loading = true;
  this.cdr.detectChanges(); // ← add this
  this.providerService.getMyRequests().subscribe({
    next: (data) => {
      this.requests = data;
      this.loading  = false;
      this.cdr.detectChanges(); // ← change markForCheck to this
    },
    error: (err) => {
      console.error('Failed to load requests', err);
      this.loading = false;
      this.cdr.detectChanges(); // ← change markForCheck to this
    }
  });
}

  onSubmit(): void {
    if (this.providerForm.invalid) {
      this.providerForm.markAllAsTouched();
      return;
    }
    this.submitting     = true;
    this.successMessage = '';
    this.errorMessage   = '';
    const raw = this.providerForm.getRawValue();
    const payload = {
      patientName:          raw.patientName!,
      patientId:            raw.patientId!,
      insuranceId:          raw.insuranceId!,
      diagnosisCode:        raw.diagnosisCode!,
      procedureCode:        raw.procedureCode!,
      treatmentDescription: raw.treatmentDescription!,
      admissionDate:        raw.admissionDate!,
      expectedDischargeDate:raw.expectedDischargeDate || undefined,
      priority:             raw.priority!.toUpperCase(),
    };
    this.providerService.submitRequest(payload).subscribe({
      next: (res) => {
        this.submitting       = false;
        this.successMessage   = `Request submitted! ID: ${res.id}`;
        this.providerForm.reset({ priority: 'NORMAL' });
        this.fieldSuggestions = {};
        this.fieldChips       = {};
        this.fieldLoading     = {};
        this.showForm         = false;
        this.loadRequests();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.submitting   = false;
        this.errorMessage = err.error?.message || 'Failed to submit.';
        this.cdr.markForCheck();
      }
    });
  }

  fetchFieldSuggestion(fieldName: string): void {
    const value = (this.providerForm.get(fieldName)?.value || '').toString().trim();
    if (!value) return;

    const formValue = this.providerForm.value;
    const payload: SuggestionPayload = {
      fieldName,
      fieldValue:           value,
      diagnosisCode:        formValue.diagnosisCode        || 'not provided',
      procedureCode:        formValue.procedureCode        || 'not provided',
      treatmentDescription: formValue.treatmentDescription || 'not provided',
    };

    // Clear loading on any previously pending field before starting new one
    this.ngZone.run(() => {
      if (this.pendingField && this.pendingField !== fieldName) {
        this.fieldLoading = { ...this.fieldLoading, [this.pendingField]: false };
      }
      this.pendingField     = fieldName;
      this.fieldLoading     = { ...this.fieldLoading,     [fieldName]: true };
      this.fieldSuggestions = { ...this.fieldSuggestions, [fieldName]: ''   };
      this.fieldChips       = { ...this.fieldChips,       [fieldName]: []   };
      this.fieldErrors      = { ...this.fieldErrors,      [fieldName]: ''   };
      // ✅ detectChanges() forces immediate re-render for OnPush
      this.cdr.detectChanges();
    });

    this.providerService.getFieldSuggestion(payload).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.fieldSuggestions = { ...this.fieldSuggestions, [fieldName]: res.suggestion };
          this.fieldChips       = { ...this.fieldChips,       [fieldName]: this.parseChips(fieldName, res.suggestion) };
          this.fieldLoading     = { ...this.fieldLoading,     [fieldName]: false };
          this.fieldErrors      = { ...this.fieldErrors,      [fieldName]: '' };
          if (this.pendingField === fieldName) this.pendingField = null;
          // ✅ detectChanges() forces immediate re-render for OnPush
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.fieldErrors  = { ...this.fieldErrors,  [fieldName]: 'Could not fetch suggestion.' };
          this.fieldLoading = { ...this.fieldLoading, [fieldName]: false };
          if (this.pendingField === fieldName) this.pendingField = null;
          // ✅ detectChanges() forces immediate re-render for OnPush
          this.cdr.detectChanges();
        });
      }
    });
  }

  parseChips(fieldName: string, suggestion: string): string[] {
    if (suggestion.startsWith('✓')) return [];

    const didYouMean = suggestion.match(/Did you mean[:\s]+(.+?)[\?\.]*$/i);
    if (didYouMean) {
      return didYouMean[1]
        .split(/,\s*|\s+or\s+/)
        .map(s => s.replace(/[?.]$/, '').trim())
        .filter(s => s.length > 0);
    }

    const expectedFormat = suggestion.match(/e\.g\.\s+([A-Z0-9\-]+)(?:\s+or\s+([A-Z0-9\-]+))?/i);
    if (expectedFormat) {
      return [expectedFormat[1], expectedFormat[2]].filter(Boolean) as string[];
    }

    const suggested = suggestion.match(/^Suggested[:\s]+(.+)$/i);
    if (suggested) {
      return [suggested[1].trim()];
    }

    return [];
  }

  applyChip(fieldName: string, chipValue: string): void {
    this.providerForm.get(fieldName)?.setValue(chipValue);
    this.providerForm.get(fieldName)?.markAsTouched();
    this.ngZone.run(() => {
      this.fieldSuggestions = { ...this.fieldSuggestions, [fieldName]: '' };
      this.fieldChips       = { ...this.fieldChips,       [fieldName]: [] };
      this.cdr.markForCheck();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.providerForm.get(controlName);
    if (!control || !control.invalid || !(control.touched || control.dirty)) return '';
    if (control.hasError('required'))  return 'This field is required';
    if (control.hasError('minlength')) {
      const req = control.errors?.['minlength'].requiredLength;
      return `Minimum ${req} characters required`;
    }
    if (control.hasError('pattern')) {
      const messages: Record<string, string> = {
        diagnosisCode: 'Invalid ICD-10 format — use e.g. E11.9',
        procedureCode: 'CPT must be exactly 5 digits — e.g. 99213',
        patientId:     'Alphanumeric only, 4–12 characters',
        insuranceId:   'Alphanumeric/hyphens, 5–20 characters',
      };
      return messages[controlName] ?? 'Invalid format';
    }
    return 'Invalid value';
  }

  hasError(controlName: string): boolean {
    const control = this.providerForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      SUBMITTED:    'bg-blue-100 text-blue-700',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
      APPROVED:     'bg-green-100 text-green-700',
      REJECTED:     'bg-red-100 text-red-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
  }

toggleView(): void {
  this.showForm = !this.showForm;
  if (!this.showForm) this.loadRequests();
  this.cdr.detectChanges(); // ← change markForCheck to this
}
}
