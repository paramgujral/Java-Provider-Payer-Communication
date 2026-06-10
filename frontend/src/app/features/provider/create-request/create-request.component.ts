import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from '../../../core/services/request.service';
import { AiAnalysis } from '../../../core/models/models';

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-request.component.html',
  styleUrls: ['./create-request.component.scss']
})
export class CreateRequestComponent implements OnInit {
  step      = signal(1);
  totalSteps = 3;
  saving    = signal(false);
  error     = signal('');
  aiLoading = signal(false);
  aiResult  = signal<AiAnalysis | null>(null);
  savedId   = signal<number | null>(null);

  form!: FormGroup;

  readonly steps = [
    { num: 1, label: 'Patient Info',  icon: 'person' },
    { num: 2, label: 'Clinical Info', icon: 'biotech' },
    { num: 3, label: 'Review & AI',   icon: 'smart_toy' }
  ];

  readonly serviceTypes = [
    'Inpatient', 'Outpatient', 'Specialist', 'Emergency',
    'Lab/Diagnostics', 'Imaging', 'Physical Therapy', 'Mental Health',
    'Preventive Care', 'Durable Medical Equipment'
  ];

  readonly priorities = [
    { value: 'URGENT', label: '🔴 Urgent' },
    { value: 'HIGH',   label: '🟠 High'   },
    { value: 'NORMAL', label: '🟡 Normal' },
    { value: 'LOW',    label: '🟢 Low'    }
  ];

  progressPct = computed(() => ((this.step() - 1) / (this.totalSteps - 1)) * 100);

  constructor(
    private fb: FormBuilder,
    private requestSvc: RequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      // Step 1 - Patient
      patientName:         ['', Validators.required],
      patientDob:          ['', Validators.required],
      patientMemberId:     ['', Validators.required],
      patientInsurancePlan:[''],
      priority:            ['NORMAL', Validators.required],

      // Step 2 - Clinical
      diagnosisCode:        ['', [Validators.required,
        Validators.pattern(/^[A-Z][0-9]{2}(\.[0-9A-Z]{1,4})?$/)]],
      diagnosisDescription: ['', Validators.required],
      procedureCode:        ['', Validators.required],
      procedureDescription: ['', Validators.required],
      serviceType:          ['', Validators.required],
      requestedServiceDate: ['', Validators.required],
      requestedServiceEndDate: ['', Validators.required],
      facilityName:         [''],
      treatingPhysician:    [''],
      clinicalNotes:        [''],
      supportingDocuments:  ['']
    });
  }

  // ─── Step navigation ──────────────────────────────────────────────────────

  next(): void {
    if (!this.isStepValid()) {
      this.markStepTouched();
      return;
    }
    if (this.step() < this.totalSteps) {
      this.step.update(s => s + 1);
      if (this.step() === 3) this.saveDraftAndAnalyze();
    }
  }

  back(): void {
    if (this.step() > 1) this.step.update(s => s - 1);
  }

  isStepValid(): boolean {
    const step1Fields = ['patientName', 'patientDob', 'patientMemberId', 'priority'];
    const step2Fields = ['diagnosisCode', 'diagnosisDescription', 'procedureCode',
                         'procedureDescription', 'serviceType',
                         'requestedServiceDate', 'requestedServiceEndDate'];
    const fields = this.step() === 1 ? step1Fields : step2Fields;
    return fields.every(f => this.form.get(f)?.valid);
  }

  markStepTouched(): void {
    const step1 = ['patientName','patientDob','patientMemberId','priority'];
    const step2 = ['diagnosisCode','diagnosisDescription','procedureCode',
                   'procedureDescription','serviceType',
                   'requestedServiceDate','requestedServiceEndDate'];
    const fields = this.step() === 1 ? step1 : step2;
    fields.forEach(f => this.form.get(f)?.markAsTouched());
  }

  // ─── Save draft + run AI ──────────────────────────────────────────────────

  saveDraftAndAnalyze(): void {
    this.saving.set(true);
    this.aiLoading.set(true);
    this.error.set('');

    this.requestSvc.createRequest(this.form.value).subscribe({
      next: req => {
        this.savedId.set(req.id);
        this.saving.set(false);
        // Fetch AI analysis
        this.requestSvc.getAiAnalysis(req.id).subscribe({
          next: ai => { this.aiResult.set(ai); this.aiLoading.set(false); },
          error: ()  => { this.aiLoading.set(false); }
        });
      },
      error: err => {
        this.error.set(err.error?.error || 'Failed to save request. Please try again.');
        this.saving.set(false);
        this.aiLoading.set(false);
        this.step.set(2);
      }
    });
  }

  // ─── Final actions ────────────────────────────────────────────────────────

  submitRequest(): void {
    if (!this.savedId()) return;
    this.saving.set(true);
    this.requestSvc.submitRequest(this.savedId()!).subscribe({
      next: () => this.router.navigate(['/provider/requests'],
        { queryParams: { submitted: 'true' } }),
      error: err => {
        this.error.set(err.error?.error || 'Failed to submit request.');
        this.saving.set(false);
      }
    });
  }

  saveDraft(): void {
    if (this.savedId()) {
      this.router.navigate(['/provider/requests']);
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  scoreColor(score: number): string {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  }

  riskClass(risk: string): string {
    return { LOW: 'alert-success', MEDIUM: 'alert-warning', HIGH: 'alert-error' }[risk] ?? '';
  }

  f(name: string) { return this.form.get(name)!; }
  isInvalid(name: string): boolean {
    const c = this.form.get(name)!;
    return c.invalid && c.touched;
  }
}
