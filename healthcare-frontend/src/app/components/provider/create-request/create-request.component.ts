import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthorizationService } from '../../../services/authorization.service';
import { ReferenceService, MedicalCode, Payer } from '../../../services/reference.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-request.component.html',
  styleUrls: ['./create-request.component.css']
})
export class CreateRequestComponent implements OnInit, OnDestroy {
  requestForm: FormGroup;
  isSubmitting = false;
  aiReview: any = null;
  showAiModal = false;

  payers: Payer[] = [];

  // Autocomplete State
  diagnosisSearch$ = new Subject<string>();
  procedureSearch$ = new Subject<string>();

  diagnosisResults: MedicalCode[] = [];
  procedureResults: MedicalCode[] = [];

  selectedDiagnosis: MedicalCode[] = [];
  selectedProcedures: MedicalCode[] = [];

  showDiagnosisDropdown = false;
  showProcedureDropdown = false;

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthorizationService,
    private refService: ReferenceService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      memberId: ['', Validators.required],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      phone: ['', Validators.required],
      targetPayer: ['', Validators.required],
      serviceType: ['Outpatient', Validators.required],
      urgency: ['Routine', Validators.required],
      diagnosisSearchInput: [''],
      procedureSearchInput: [''],
      clinicalNotes: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.subs.push(
      this.diagnosisSearch$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => this.refService.searchDiagnosis(term))
      ).subscribe(results => {
        this.diagnosisResults = results;
        this.showDiagnosisDropdown = results.length > 0;
      })
    );

    this.subs.push(
      this.procedureSearch$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => this.refService.searchProcedures(term))
      ).subscribe(results => {
        this.procedureResults = results;
        this.showProcedureDropdown = results.length > 0;
      })
    );

    this.refService.getPayers().subscribe(res => {
      this.payers = res;
    });
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  onDiagnosisSearch(event: any) {
    const value = event.target.value;
    if (value) {
      this.diagnosisSearch$.next(value);
    } else {
      this.showDiagnosisDropdown = false;
    }
  }

  onProcedureSearch(event: any) {
    const value = event.target.value;
    if (value) {
      this.procedureSearch$.next(value);
    } else {
      this.showProcedureDropdown = false;
    }
  }

  selectDiagnosis(code: MedicalCode) {
    if (!this.selectedDiagnosis.find(c => c.code === code.code)) {
      this.selectedDiagnosis.push(code);
    }
    this.requestForm.patchValue({ diagnosisSearchInput: '' });
    this.showDiagnosisDropdown = false;
  }

  selectProcedure(code: MedicalCode) {
    if (!this.selectedProcedures.find(c => c.code === code.code)) {
      this.selectedProcedures.push(code);
    }
    this.requestForm.patchValue({ procedureSearchInput: '' });
    this.showProcedureDropdown = false;
  }

  removeDiagnosis(codeToRemove: string) {
    this.selectedDiagnosis = this.selectedDiagnosis.filter(c => c.code !== codeToRemove);
  }

  removeProcedure(codeToRemove: string) {
    this.selectedProcedures = this.selectedProcedures.filter(c => c.code !== codeToRemove);
  }

  hideDropdowns() {
    setTimeout(() => {
      this.showDiagnosisDropdown = false;
      this.showProcedureDropdown = false;
    }, 200);
  }

  private buildRequestObject() {
    const formData = this.requestForm.value;
    return {
      providerId: localStorage.getItem('userId') || '',
      payerId: formData.targetPayer, // Dynamic payer routing
      patientInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        memberId: formData.memberId,
        dateOfBirth: formData.dob,
        gender: formData.gender,
        phone: formData.phone
      },
      serviceType: formData.serviceType,
      urgency: formData.urgency,
      diagnosisCodes: this.selectedDiagnosis.map(c => c.code),
      procedureCodes: this.selectedProcedures.map(c => c.code),
      clinicalNotes: formData.clinicalNotes,
      coverageInfo: {
        insurancePlanId: '',
        groupNumber: '',
        subscriberId: '',
        relationshipToSubscriber: 'self'
      }
    };
  }

  onSubmit() {
    if (this.requestForm.invalid || this.selectedDiagnosis.length === 0 || this.selectedProcedures.length === 0) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const requestPayload = this.buildRequestObject();
    this.isSubmitting = true;

    // First run AI Copilot Review
    this.authService.analyzeRequest(requestPayload).subscribe({
      next: (res: any) => {
        this.aiReview = res;
        this.showAiModal = true;
        this.isSubmitting = false;
      },
      error: (err: any) => {
        console.error('AI Review failed, proceeding to submit anyway', err);
        // If AI fails, we fall back to standard submission
        this.isSubmitting = false;
        this.confirmSubmit();
      }
    });
  }

  confirmSubmit() {
    this.showAiModal = false;
    this.isSubmitting = true;

    const requestPayload = this.buildRequestObject();

    this.authService.createRequest(requestPayload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.router.navigate(['/provider/dashboard']);
      },
      error: (err: any) => {
        console.error('Submission failed', err);
        this.isSubmitting = false;
        alert('Failed to submit request.');
      }
    });
  }
}
