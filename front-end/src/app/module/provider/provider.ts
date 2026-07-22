import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  AuthRequestResponse,
  FieldGuideSuggestion,
  FormAiReviewResult,
  ProviderRequestsService,
  SuggestionPayload
} from './provider.service';

@Component({
  selector: 'app-provider',
  templateUrl: './provider.html',
  styleUrls: ['./provider.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProviderPortalComponent implements OnInit, OnDestroy {
  requests: AuthRequestResponse[] = [];
  loading        = false;
  submitting     = false;
  reviewingAi    = false;
  canSubmitAfterAiReview = false;
  aiReviewResult: FormAiReviewResult | null = null;
  aiReviewMessage = '';
  successMessage = '';
  errorMessage   = '';
  showForm       = true;
  selectedRequest: AuthRequestResponse | null = null;
  private routeSub: Subscription | null = null;
  private formChangeSub: Subscription | null = null;

  fieldSuggestions: Record<string, string>  = {};
  fieldLoading:     Record<string, boolean> = {};
  fieldErrors:      Record<string, string>  = {};
  fieldChips:       Record<string, string[]> = {};

  // Track pending request per field so we can mark stale ones
  private pendingField: string | null = null;

  // No Angular validators — missing fields / warnings / score come from AI only
  providerForm = this.formBuilder.group({
    patientName:          [''],
    patientId:            [''],
    insuranceId:          [''],
    diagnosisCode:        [''],
    procedureCode:        [''],
    treatmentDescription: [''],
    admissionDate:        [''],
    expectedDischargeDate:[''],
    priority:             ['NORMAL'],
  });

  constructor(
    private formBuilder: FormBuilder,
    private providerRequestsService: ProviderRequestsService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.queryParams.subscribe((params) => {
      if (params.view === 'list') {
        this.showForm = false;
        this.selectedRequest = null;
        this.clearStatusMessages();
        this.loadProviderRequests();
      } else if (params.view === 'create') {
        this.openCreateForm();
      }
      this.cdr.markForCheck();
    });

    // Disable Submit if user edits after a successful review — do NOT auto-call AI
    this.formChangeSub = this.providerForm.valueChanges.subscribe(() => {
      if (this.canSubmitAfterAiReview || this.aiReviewResult) {
        this.canSubmitAfterAiReview = false;
        this.aiReviewMessage = 'Form changed. Click Review with AI again before Submit.';
        this.cdr.markForCheck();
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.loadProviderRequests();
    }
  }

  /** Fresh create screen — never reuse a previous submit banner. */
  private openCreateForm(): void {
    this.showForm = true;
    this.selectedRequest = null;
    this.clearStatusMessages();
    this.resetAiReviewGate('');
    this.providerForm.reset({ priority: 'NORMAL' });
    this.fieldSuggestions = {};
    this.fieldChips = {};
    this.fieldLoading = {};
    this.fieldErrors = {};
  }

  private clearStatusMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private resetAiReviewGate(message: string): void {
    this.canSubmitAfterAiReview = false;
    this.aiReviewResult = null;
    this.aiReviewMessage = message;
  }

  /** AI API is called only when user clicks Review with AI. */
  reviewWithAi(): void {
    if (this.submitting || this.reviewingAi) {
      return;
    }
    this.reviewingAi = true;
    this.errorMessage = '';
    this.canSubmitAfterAiReview = false;
    this.aiReviewMessage = 'Sending form to AI for validation...';
    this.aiReviewResult = null;
    this.cdr.markForCheck();

    const raw = this.providerForm.getRawValue();
    this.providerRequestsService.reviewWithAi({
      patientName: String(raw.patientName || ''),
      patientId: String(raw.patientId || ''),
      insuranceId: String(raw.insuranceId || ''),
      diagnosisCode: String(raw.diagnosisCode || ''),
      procedureCode: String(raw.procedureCode || ''),
      treatmentDescription: String(raw.treatmentDescription || ''),
      admissionDate: String(raw.admissionDate || ''),
      expectedDischargeDate: raw.expectedDischargeDate || undefined,
      priority: String(raw.priority || 'NORMAL')
    }).subscribe({
      next: (result) => {
        this.reviewingAi = false;
        this.aiReviewResult = result;
        this.canSubmitAfterAiReview = !!result.ready;
        this.aiReviewMessage = this.canSubmitAfterAiReview
          ? 'AI review passed. Submit is now enabled.'
          : 'Fix missing / warnings, then click Review with AI again.';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.reviewingAi = false;
        this.canSubmitAfterAiReview = false;
        this.aiReviewResult = null;
        const issue = err?.error?.issue?.[0]?.diagnostics;
        this.errorMessage = issue
          || err?.error?.diagnostics
          || err?.error?.message
          || 'AI validation failed. Check Gemini API key.';
        this.aiReviewMessage = '';
        this.cdr.markForCheck();
      }
    });
  }

  hasMissing(): boolean {
    return !!(this.aiReviewResult?.missing?.length);
  }

  hasWarnings(): boolean {
    return !!(this.aiReviewResult?.warnings?.length);
  }

  trackGuide(_index: number, tip: FieldGuideSuggestion): string {
    return `${tip.type}-${tip.field}-${tip.issue}`;
  }
loadProviderRequests(): void {
  if (!isPlatformBrowser(this.platformId)) return;
  this.loading = true;
  this.cdr.detectChanges();
  this.providerRequestsService.getMyRequests().subscribe({
    next: (data) => {
      this.requests = data;
      this.loading  = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Failed to load requests', err);
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  submitProviderRequest(): void {
    if (!this.canSubmitAfterAiReview) {
      this.errorMessage = 'Please complete Review with AI successfully before Submit.';
      this.cdr.markForCheck();
      return;
    }
    this.submitting     = true;
    this.successMessage = '';
    this.errorMessage   = '';
    const raw = this.providerForm.getRawValue();
    const payload = {
      patientName:          String(raw.patientName || ''),
      patientId:            String(raw.patientId || ''),
      insuranceId:          String(raw.insuranceId || ''),
      diagnosisCode:        String(raw.diagnosisCode || ''),
      procedureCode:        String(raw.procedureCode || ''),
      treatmentDescription: String(raw.treatmentDescription || ''),
      admissionDate:        String(raw.admissionDate || ''),
      expectedDischargeDate: raw.expectedDischargeDate || undefined,
      priority:             String(raw.priority || 'NORMAL').toUpperCase(),
    };
    this.providerRequestsService.submitRequest(payload).subscribe({
      next: (res) => {
        this.submitting       = false;
        this.successMessage   = `Request submitted! ID: ${res.id}`;
        this.providerForm.reset({ priority: 'NORMAL' });
        this.resetAiReviewGate('');
        this.fieldSuggestions = {};
        this.fieldChips       = {};
        this.fieldLoading     = {};
        this.showForm         = false;
        this.loadProviderRequests();
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
      this.cdr.detectChanges();
    });

    this.providerRequestsService.getFieldSuggestion(payload).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.fieldSuggestions = { ...this.fieldSuggestions, [fieldName]: res.suggestion };
          this.fieldChips       = { ...this.fieldChips,       [fieldName]: this.parseChips(fieldName, res.suggestion) };
          this.fieldLoading     = { ...this.fieldLoading,     [fieldName]: false };
          this.fieldErrors      = { ...this.fieldErrors,      [fieldName]: '' };
          if (this.pendingField === fieldName) this.pendingField = null;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.fieldErrors  = { ...this.fieldErrors,  [fieldName]: 'Could not fetch suggestion.' };
          this.fieldLoading = { ...this.fieldLoading, [fieldName]: false };
          if (this.pendingField === fieldName) this.pendingField = null;
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

  getErrorMessage(_controlName: string): string {
    // Frontend validators disabled — AI review box shows missing/warnings
    return '';
  }

  hasError(_controlName: string): boolean {
    return false;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      SUBMITTED:    'bg-yellow-100',
      UNDER_REVIEW: 'bg-blue-100',
      APPROVED:     'bg-green-100',
      REJECTED:     'bg-red-100',
    };
    return map[status] ?? 'bg-gray-100';
  }

  toggleRequestView(): void {
    if (this.showForm) {
      this.showForm = false;
      this.selectedRequest = null;
      this.clearStatusMessages();
      this.loadProviderRequests();
    } else {
      this.openCreateForm();
    }
    this.cdr.detectChanges();
  }

  openRequestDetails(request: AuthRequestResponse): void {
    this.selectedRequest = request;
    this.showForm = false;
    this.cdr.markForCheck();
  }

  closeRequestDetails(): void {
    this.selectedRequest = null;
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.formChangeSub) {
      this.formChangeSub.unsubscribe();
    }
  }
}
