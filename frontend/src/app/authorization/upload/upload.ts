import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AiReviewResponse, AiService } from '../../core/services/ai.service';
import { AuthorizationResponse, AuthorizationService, AuthorizationUploadPayload } from '../../core/services/authorization.service';

@Component({
  selector: 'app-upload',
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.html',
  styleUrl: './upload.css',
})
export class UploadComponent implements OnInit {
  form: AuthorizationUploadPayload = {
    requestNumber: 'AUTH-' + Math.floor(Math.random() * 9000 + 1000),
    providerId: 1,
    payerId: 1,
    patientName: '',
    patientDob: '',
    patientGender: '',
    patientPhone: '',
    patientAddress: '',
    insuranceCompany: '',
    policyNumber: '',
    memberId: '',
    coverageType: '',
    doctorName: '',
    npiNumber: '',
    hospital: '',
    specialty: '',
    diagnosis: '',
    icd10Code: '',
    procedureName: '',
    cptCode: '',
    reasonForAuthorization: '',
    mriReport: '',
    labReport: '',
    prescription: '',
    medicalHistory: '',
    payload: ''
  };
  requests: AuthorizationResponse[] = [];
  message = '';
  currentDraftId: number | null = null;
  aiReview: AiReviewResponse | null = null;
  savingDraft = false;
  reviewing = false;
  submitting = false;
  loadingDraftId: number | null = null;

  constructor(
    private authorizationService: AuthorizationService,
    private aiService: AiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.authorizationService.list().subscribe({
      next: (response) => {
        this.requests = response.data ?? [];
      }
    });
  }

  saveDraft(): void {
    this.savingDraft = true;
    this.message = 'Saving draft...';
    this.form.payload = this.buildDraftSnapshot();

    this.authorizationService.saveDraft(this.form)
      .pipe(finalize(() => {
        this.savingDraft = false;
      }))
      .subscribe({
        next: (response) => {
          const draft = response.data;
          this.currentDraftId = draft?.id ?? null;
          this.mergeRequest(draft);
          this.message = 'Draft saved successfully.';
          this.loadRequests();
        },
        error: (error) => {
          this.message = error?.error?.message || 'Unable to save draft.';
        }
      });
  }

  reviewWithAi(): void {
    const afterSave = this.saveDraftAndReturnId();

    afterSave.then((draftId) => {
      if (!draftId) {
        return;
      }

      this.reviewing = true;
      this.message = 'Reviewing with AI...';
      this.aiService.review(this.toAiPayload())
        .pipe(finalize(() => {
          this.reviewing = false;
        }))
        .subscribe({
          next: (response) => {
            const aiData = response.data;
            this.aiReview = {
              score: aiData.score,
              missing: aiData.missing ?? [],
              warnings: aiData.warnings ?? [],
              readyForSubmission: aiData.readyForSubmission
            };
            this.authorizationService.saveAiReview(draftId, aiData).subscribe({
              next: (savedResponse) => {
                this.mergeRequest(savedResponse.data);
                this.loadRequests();
              }
            });
            this.message = response.data.readyForSubmission
              ? 'AI review passed. Ready for submission.'
              : 'AI review found issues to fix.';
          },
          error: (error) => {
            this.message = error?.error?.message || 'Unable to complete AI review.';
          }
        });
    });
  }

  submitRequest(): void {
    if (!this.aiReview?.readyForSubmission) {
      this.message = 'Run AI review and fix all issues before submitting.';
      return;
    }

    this.saveDraftAndReturnId().then((draftId) => {
      if (!draftId) {
        this.message = 'Unable to save latest draft before submitting.';
        return;
      }

      this.submitting = true;
      this.message = 'Generating FHIR resources and validating submission...';
      this.authorizationService.submit(draftId)
        .pipe(finalize(() => {
          this.submitting = false;
        }))
        .subscribe({
        next: (response) => {
            const submitted = response.data;
            this.mergeRequest(submitted);
            this.message = 'Authorization request submitted successfully.';
            this.loadRequests();
        },
          error: (error) => {
            this.message = error?.error?.message || 'Unable to submit authorization request.';
          }
        });
    });
  }

  loadDraft(request: AuthorizationResponse): void {
    this.loadingDraftId = request.id;
    this.authorizationService.getById(request.id)
      .pipe(finalize(() => {
        this.loadingDraftId = null;
      }))
      .subscribe({
        next: (response) => {
          const item = response.data;
          this.currentDraftId = item.id;
          Object.assign(this.form, this.mapToForm(item));
          const missingFromAi = item.aiMissing ?? [];
          const warningsFromAi = item.aiWarnings ?? [];
          this.aiReview = {
            score: item.aiScore ?? 0,
            missing: missingFromAi,
            warnings: warningsFromAi,
            readyForSubmission: (missingFromAi?.length ?? 0) === 0 && (warningsFromAi?.length ?? 0) === 0 && (item.aiScore ?? 0) === 100
          };
          this.message = `Loaded ${item.requestNumber} into the draft form.`;
          this.cdr.detectChanges();
        },
        error: () => {
          this.message = 'Unable to load the selected request.';
        }
      });
  }

  private saveDraftAndReturnId(): Promise<number | null> {
    this.savingDraft = true;
    this.form.payload = this.buildDraftSnapshot();
    return new Promise((resolve) => {
      this.authorizationService.saveDraft(this.form)
        .pipe(finalize(() => {
          this.savingDraft = false;
        }))
        .subscribe({
          next: (response) => {
            const draft = response.data;
            this.currentDraftId = draft?.id ?? null;
            this.mergeRequest(draft);
            this.loadRequests();
            resolve(this.currentDraftId);
          },
          error: () => {
            this.message = 'Unable to save draft for AI review.';
            resolve(null);
          }
        });
    });
  }

  private toAiPayload() {
    return {
      patientName: this.form.patientName,
      insuranceCompany: this.form.insuranceCompany,
      policyNumber: this.form.policyNumber,
      memberId: this.form.memberId,
      coverageType: this.form.coverageType,
      doctorName: this.form.doctorName,
      npiNumber: this.form.npiNumber,
      hospital: this.form.hospital,
      specialty: this.form.specialty,
      diagnosis: this.form.diagnosis,
      icd10Code: this.form.icd10Code,
      procedureName: this.form.procedureName,
      cptCode: this.form.cptCode,
      reasonForAuthorization: this.form.reasonForAuthorization,
      mriReport: this.form.mriReport,
      labReport: this.form.labReport,
      prescription: this.form.prescription,
      medicalHistory: this.form.medicalHistory
    };
  }

  private buildDraftSnapshot(): string {
    return JSON.stringify(this.form, null, 2);
  }

  private mapToForm(item: AuthorizationResponse): AuthorizationUploadPayload {
    return {
      requestNumber: item.requestNumber,
      providerId: item.providerId,
      payerId: item.payerId,
      patientName: item.patientName || '',
      patientDob: item.patientDob || '',
      patientGender: item.patientGender || '',
      patientPhone: item.patientPhone || '',
      patientAddress: item.patientAddress || '',
      insuranceCompany: item.insuranceCompany || '',
      policyNumber: item.policyNumber || '',
      memberId: item.memberId || '',
      coverageType: item.coverageType || '',
      doctorName: item.doctorName || '',
      npiNumber: item.npiNumber || '',
      hospital: item.hospital || '',
      specialty: item.specialty || '',
      diagnosis: item.diagnosis || '',
      icd10Code: item.icd10Code || '',
      procedureName: item.procedureName || '',
      cptCode: item.cptCode || '',
      reasonForAuthorization: item.reasonForAuthorization || '',
      mriReport: item.mriReport || '',
      labReport: item.labReport || '',
      prescription: item.prescription || '',
      medicalHistory: item.medicalHistory || '',
      payload: item.claimResourceJson || item.patientResourceJson || ''
    };
  }

  private mergeRequest(request: AuthorizationResponse | undefined): void {
    if (!request) {
      return;
    }

    const existingIndex = this.requests.findIndex((item) => item.id === request.id || item.requestNumber === request.requestNumber);
    if (existingIndex === -1) {
      this.requests = [request, ...this.requests];
      return;
    }

    this.requests = this.requests.map((item, index) => index === existingIndex ? request : item);
  }
}
