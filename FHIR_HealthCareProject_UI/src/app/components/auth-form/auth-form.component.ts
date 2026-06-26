import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, AIReviewResult } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.css'
})
export class AuthFormComponent implements OnInit {
  requestId: number | null = null;
  isEditMode = signal(false);
  submitting = signal(false);
  reviewing = signal(false);
  
  patients = signal<any[]>([]);
  coverages = signal<any[]>([]);

  form = {
    patientId: null as number | null,
    coverageId: null as number | null,
    diagnosisCode: '',
    diagnosisDescription: '',
    treatmentCode: '',
    treatmentDescription: '',
    notes: '',
    providerId: 1
  };

  aiResult = signal<AIReviewResult | null>(null);

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.requestId = +idParam;
      this.isEditMode.set(true);
      this.loadRequestDetails(this.requestId);
    }

    // Load patients dynamically
    this.api.getPatients().subscribe(list => this.patients.set(list));
  }

  loadRequestDetails(id: number) {
    this.api.getRequestDetails(id).subscribe({
      next: (data) => {
        const req = data.request;
        this.form = {
          patientId: req.patient.id,
          coverageId: req.coverage.id,
          diagnosisCode: req.diagnosisCode,
          diagnosisDescription: req.diagnosisDescription || '',
          treatmentCode: req.treatmentCode,
          treatmentDescription: req.treatmentDescription || '',
          notes: req.notes || '',
          providerId: req.provider.id
        };
        // Fetch matching coverages on load
        this.api.getCoveragesForPatient(req.patient.id).subscribe(covs => {
          this.coverages.set(covs);
        });
        // Auto trigger AI evaluation on load for editing
        this.runAiReview();
      }
    });
  }

  onPatientChange() {
    if (this.form.patientId) {
      this.api.getCoveragesForPatient(this.form.patientId).subscribe(list => {
        this.coverages.set(list);
        if (list.length > 0) {
          this.form.coverageId = list[0].id;
        } else {
          this.form.coverageId = null;
        }
      });
    } else {
      this.coverages.set([]);
      this.form.coverageId = null;
    }
  }

  onCodeInput() {
    // Basic automatic medical terms descriptions helper
    const diag = this.form.diagnosisCode.trim().toUpperCase();
    if (diag === 'M17.11') {
      this.form.diagnosisDescription = 'Unilateral primary osteoarthritis, right knee';
    } else if (diag === 'I25.10') {
      this.form.diagnosisDescription = 'Atherosclerotic heart disease of native coronary artery';
    }

    const treat = this.form.treatmentCode.trim();
    if (treat === '27447') {
      this.form.treatmentDescription = 'Arthroplasty, knee, condyle and plateau';
    } else if (treat === '93458') {
      this.form.treatmentDescription = 'Combined right and left heart catheterization';
    }
  }

  onNotesInput() {
    // No-op for now; hooks into trigger
  }

  runAiReview() {
    if (!this.form.patientId) return;
    this.reviewing.set(true);

    const payload = {
      ...this.form,
      patientId: this.form.patientId,
      coverageId: this.form.coverageId
    };

    this.api.reviewRequest(payload).subscribe({
      next: (res) => {
        this.aiResult.set(res);
        this.reviewing.set(false);
      },
      error: () => {
        this.reviewing.set(false);
      }
    });
  }

  saveDraft() {
    this.saveRequest('DRAFT');
  }

  submitRequest() {
    this.saveRequest('SUBMITTED');
  }

  private saveRequest(status: string) {
    this.submitting.set(true);
    const user = this.auth.currentUser();
    
    const payload = {
      ...this.form,
      status: status,
      providerId: user ? user.id : 1
    };

    const action$ = this.isEditMode() && this.requestId
      ? this.api.updateRequest(this.requestId, payload)
      : this.api.createRequest(payload);

    action$.subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
        this.submitting.set(false);
      },
      error: (err) => {
        alert(err.error?.error || 'Validation error while formatting FHIR claim. Please check inputs and AI logs.');
        this.submitting.set(false);
      }
    });
  }

  getScoreColor(score: number): string {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-danger';
  }

  getScoreBg(score: number): string {
    if (score >= 90) return 'bg-success';
    if (score >= 70) return 'bg-warning';
    return 'bg-danger';
  }
}
