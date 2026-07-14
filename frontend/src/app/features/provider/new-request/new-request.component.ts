import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RequestService, PayerLookup } from '../../../core/services/request.service';
import { AIValidationResponse, AIAutoCorrection } from '../../../core/models/ai-validation.model';
import { AuthorizationRequest } from '../../../core/models/authorization-request.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-new-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './new-request.component.html',
  styleUrls: ['./new-request.component.css']
})
export class NewRequestComponent implements OnInit {
  patientForm!: FormGroup;
  insuranceForm!: FormGroup;
  diagnosisForm!: FormGroup;
  procedureForm!: FormGroup;
  clinicalForm!: FormGroup;

  payers: PayerLookup[] = [];
  selectedFiles: File[] = [];
  aiReport: AIValidationResponse | null = null;
  
  isValidating = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private requestService: RequestService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadPayers();
  }

  private initForms(): void {
    this.patientForm = this.fb.group({
      patientFirstName: ['', [Validators.required, Validators.minLength(2)]],
      patientLastName: ['', [Validators.required, Validators.minLength(2)]],
      patientDob: ['', Validators.required],
      patientGender: ['', Validators.required],
      patientPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      patientEmail: ['', [Validators.email]],
      patientAddress: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.insuranceForm = this.fb.group({
      payerId: ['', Validators.required],
      insurancePolicyNumber: ['', Validators.required],
      insuranceGroupNumber: [''],
      subscriberName: ['', [Validators.required, Validators.minLength(2)]],
      subscriberRelationship: ['', Validators.required],
      coverageStartDate: ['', Validators.required],
      coverageEndDate: ['']
    });

    this.diagnosisForm = this.fb.group({
      primaryDiagnosisCode: ['', [Validators.required, Validators.pattern('^[A-Z][0-9][0-9](\\.[0-9A-Z]{1,4})?$')]],
      primaryDiagnosisDesc: ['', Validators.required],
      secondaryDiagnosisCode: [''],
      secondaryDiagnosisDesc: ['']
    });

    this.procedureForm = this.fb.group({
      procedureCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      procedureDescription: ['', Validators.required],
      estimatedCost: ['', [Validators.required, Validators.min(1)]],
      serviceDate: ['', Validators.required],
      urgency: ['', Validators.required],
      placeOfService: ['', Validators.required]
    });

    this.clinicalForm = this.fb.group({
      clinicalNotes: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  loadPayers(): void {
    this.requestService.getPayers().subscribe({
      next: (res) => {
        if (res.success) {
          this.payers = res.data;
        }
      },
      error: (err) => {
        this.snackBar.open('Failed to load target insurance providers.', 'Close', { duration: 4000 });
      }
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          this.snackBar.open(`File "${file.name}" exceeds 5MB size limit.`, 'Close', { duration: 3000 });
          continue;
        }
        this.selectedFiles.push(file);
      }
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getCombinedData(): any {
    return {
      ...this.patientForm.value,
      ...this.insuranceForm.value,
      ...this.diagnosisForm.value,
      ...this.procedureForm.value,
      ...this.clinicalForm.value
    };
  }

  runAiValidation(): void {
    this.isValidating = true;
    const payload = this.getCombinedData();

    this.requestService.validateWithAI(payload).subscribe({
      next: (res) => {
        this.isValidating = false;
        if (res.success) {
          this.aiReport = res.data;
          this.snackBar.open('AI analysis completed successfully.', 'Close', { duration: 3000 });
        }
      },
      error: (err) => {
        this.isValidating = false;
        this.snackBar.open('Failed to perform AI validation. Check input fields.', 'Close', { duration: 4000 });
      }
    });
  }

  applyCorrection(corr: AIAutoCorrection): void {
    const field = corr.field;
    const value = corr.suggestedValue;

    if (this.patientForm.contains(field)) {
      this.patientForm.get(field)?.patchValue(value);
    } else if (this.insuranceForm.contains(field)) {
      this.insuranceForm.get(field)?.patchValue(value);
    } else if (this.diagnosisForm.contains(field)) {
      this.diagnosisForm.get(field)?.patchValue(value);
    } else if (this.procedureForm.contains(field)) {
      this.procedureForm.get(field)?.patchValue(value);
    } else if (this.clinicalForm.contains(field)) {
      this.clinicalForm.get(field)?.patchValue(value);
    }

    if (this.aiReport) {
      this.aiReport.autoCorrections = this.aiReport.autoCorrections.filter(c => c.field !== field);
    }
    this.snackBar.open(`Applied suggested value for ${this.formatFieldName(field)}.`, 'Close', { duration: 2000 });
  }

  applyAllCorrections(): void {
    if (!this.aiReport) return;
    const corrections = [...this.aiReport.autoCorrections];
    corrections.forEach(c => this.applyCorrection(c));
  }

  onSubmitDraft(): void {
    this.submitRequest('DRAFT');
  }

  onSubmitFinal(): void {
    this.submitRequest('SUBMITTED');
  }

  private submitRequest(status: 'DRAFT' | 'SUBMITTED'): void {
    if (this.patientForm.invalid || this.insuranceForm.invalid || this.diagnosisForm.invalid || this.procedureForm.invalid || this.clinicalForm.invalid) {
      this.snackBar.open('Please fix invalid fields across stepper sections.', 'Close', { duration: 4000 });
      return;
    }

    this.isSubmitting = true;
    const payload: AuthorizationRequest = {
      ...this.getCombinedData(),
      status: status
    };

    if (this.aiReport) {
      payload.aiValidationNotes = this.aiReport.clinicalSummary;
      payload.aiQualityScore = this.aiReport.qualityScore;
    }

    this.requestService.createRequest(payload).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.id) {
          const id = res.data.id;
          if (this.selectedFiles.length > 0) {
            this.uploadFiles(id);
          } else {
            this.onSuccessRedirect(status);
          }
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.snackBar.open('Failed to submit prior authorization request.', 'Close', { duration: 4000 });
      }
    });
  }

  private uploadFiles(requestId: number): void {
    const uploadObservables = this.selectedFiles.map(file => 
      this.requestService.uploadDocument(requestId, file).pipe(
        catchError(err => {
          console.error(`Failed to upload ${file.name}`, err);
          return of(null);
        })
      )
    );

    forkJoin(uploadObservables).subscribe({
      next: () => {
        this.onSuccessRedirect('SUBMITTED');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.snackBar.open('Prior auth created, but some documents failed to upload.', 'Close', { duration: 4000 });
      }
    });
  }

  private onSuccessRedirect(status: string): void {
    this.isSubmitting = false;
    this.snackBar.open(`Request has been saved as ${status} successfully.`, 'Close', { duration: 3000 });
    this.router.navigate(['/provider/dashboard']);
  }

  getScoreColor(score: number): string {
    if (score >= 75) return 'green';
    if (score >= 50) return 'orange';
    return 'red';
  }

  formatFieldName(name: string): string {
    if (!name) return '';
    const result = name.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }
}
