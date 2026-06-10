import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthorizationRequest, CopilotReview, Diagnosis, ServiceLine } from '../../models/models';

@Component({
  selector: 'app-provider',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid-2">
      <!-- ============ Request builder ============ -->
      <div class="card">
        <div class="card-head">
          <h3>Authorization Request</h3>
          <div class="btn-row">
            <button class="btn btn-ghost btn-sm" (click)="loadSample('clean')">Sample: complete</button>
            <button class="btn btn-ghost btn-sm" (click)="loadSample('gaps')">Sample: with gaps</button>
          </div>
        </div>
        <div class="card-pad">
          <p class="section-label">Patient</p>
          <div class="row">
            <div class="field"><label>Patient name</label><input [(ngModel)]="req.patientName" placeholder="Jane Doe"></div>
            <div class="field"><label>MRN</label><input [(ngModel)]="req.patientMrn" placeholder="MRN-00000"></div>
          </div>
          <div class="row">
            <div class="field"><label>Date of birth</label><input type="date" [(ngModel)]="req.patientBirthDate"></div>
            <div class="field"><label>Gender</label>
              <select [(ngModel)]="req.patientGender">
                <option value="">—</option><option value="female">Female</option>
                <option value="male">Male</option><option value="other">Other</option>
              </select>
            </div>
          </div>

          <p class="section-label" style="margin-top:8px">Coverage</p>
          <div class="row-3">
            <div class="field"><label>Payer</label><input [(ngModel)]="req.payerName" placeholder="Aetna National"></div>
            <div class="field"><label>Plan</label><input [(ngModel)]="req.planName" placeholder="Choice POS II"></div>
            <div class="field"><label>Member ID</label><input [(ngModel)]="req.memberId" placeholder="MBR-000000"></div>
          </div>

          <p class="section-label" style="margin-top:8px">Ordering provider</p>
          <div class="row-3">
            <div class="field"><label>Provider</label><input [(ngModel)]="req.providerName" placeholder="Dr. A. Rao"></div>
            <div class="field"><label>Organization</label><input [(ngModel)]="req.providerOrg" placeholder="Lakeshore Ortho"></div>
            <div class="field"><label>NPI</label><input [(ngModel)]="req.providerNpi" placeholder="1487659302"></div>
          </div>

          <p class="section-label" style="margin-top:8px">Service</p>
          <div class="row-3">
            <div class="field"><label>Priority</label>
              <select [(ngModel)]="req.priority">
                <option value="NORMAL">Normal</option><option value="URGENT">Urgent</option>
              </select>
            </div>
            <div class="field"><label>Place of service</label><input [(ngModel)]="req.placeOfService" placeholder="Outpatient Hospital"></div>
            <div class="field"><label>Planned date</label><input type="date" [(ngModel)]="req.serviceStart"></div>
          </div>

          <!-- Diagnoses -->
          <p class="section-label" style="margin-top:8px">Diagnoses (ICD-10)</p>
          <div class="row-3" *ngFor="let d of req.diagnoses; let i = index" style="margin-bottom:8px">
            <div class="field" style="margin:0"><input [(ngModel)]="d.icd10Code" placeholder="M54.16"></div>
            <div class="field" style="margin:0"><input [(ngModel)]="d.description" placeholder="Description"></div>
            <div style="display:flex;align-items:center;gap:8px">
              <label style="font-size:12px;display:flex;align-items:center;gap:5px;margin:0">
                <input type="checkbox" style="width:auto" [(ngModel)]="d.isPrincipal"> principal
              </label>
              <button class="btn btn-ghost btn-sm" (click)="removeDx(i)">&times;</button>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" (click)="addDx()">+ Add diagnosis</button>

          <!-- Service lines -->
          <p class="section-label" style="margin-top:16px">Requested services (CPT)</p>
          <div class="row-3" *ngFor="let s of req.serviceLines; let i = index" style="margin-bottom:8px">
            <div class="field" style="margin:0"><input [(ngModel)]="s.cptCode" placeholder="72148"></div>
            <div class="field" style="margin:0"><input [(ngModel)]="s.description" placeholder="MRI lumbar spine"></div>
            <div style="display:flex;align-items:center;gap:8px">
              <input type="number" [(ngModel)]="s.units" style="width:70px" min="1">
              <button class="btn btn-ghost btn-sm" (click)="removeSvc(i)">&times;</button>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" (click)="addSvc()">+ Add service</button>

          <div class="field" style="margin-top:16px">
            <label>Clinical notes &amp; medical necessity</label>
            <textarea [(ngModel)]="req.clinicalNotes" rows="4"
              placeholder="Symptom onset/duration, exam findings, prior workup, failed conservative treatment..."></textarea>
          </div>

          <div class="btn-row" style="margin-top:6px">
            <button class="btn btn-ghost" (click)="runCopilot()" [disabled]="loading">
              {{ loading ? 'Reviewing…' : '✦ Run AI Copilot review' }}
            </button>
            <button class="btn btn-primary" (click)="submit()" [disabled]="submitting">
              {{ submitting ? 'Submitting…' : 'Submit to payer' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ============ Copilot panel ============ -->
      <div>
        <div class="copilot" *ngIf="review; else placeholder">
          <div class="copilot-head">
            <div class="spark">✦</div>
            <div>
              <div style="font-weight:600">AI Copilot Review</div>
              <div style="font-size:12px;opacity:.85">Pre-submission completeness check</div>
            </div>
            <span class="src">{{ review.source }}</span>
          </div>

          <div class="gauge">
            <div class="num" [style.color]="scoreColor(review.readinessScore)">{{ review.readinessScore }}</div>
            <div class="bar">
              <div class="track">
                <div class="fill" [style.width.%]="review.readinessScore" [style.background]="scoreColor(review.readinessScore)"></div>
              </div>
              <div class="meta">
                Readiness score &middot;
                <strong [style.color]="scoreColor(review.readinessScore)">
                  {{ review.decision === 'READY' ? 'Ready to submit' : 'Needs fixes' }}
                </strong>
              </div>
            </div>
          </div>

          <div class="predict">
            <span class="status" [ngClass]="outcomeClass(review.predictedOutcome)" style="border:0">
              {{ outcomeLabel(review.predictedOutcome) }}
            </span>
            <span class="muted">{{ review.medicalNecessity }}</span>
          </div>

          <div *ngFor="let issue of review.issues" class="issue" [ngClass]="'sev-' + issue.severity">
            <div class="dot">{{ issue.severity[0] }}</div>
            <div>
              <p class="field">{{ issue.field }}</p>
              <div class="prob">{{ issue.problem }}</div>
              <div class="rec">→ {{ issue.recommendation }}
                <span *ngIf="issue.autoFixable" class="chip" style="background:var(--green-soft);color:var(--green);margin-left:6px">auto-fixable</span>
              </div>
            </div>
          </div>

          <div class="card-pad" style="background:var(--paper);border-top:1px solid var(--line)">
            <strong>Summary.</strong> {{ review.summary }}
          </div>
        </div>

        <ng-template #placeholder>
          <div class="card card-pad empty">
            <div class="big">✦ AI Copilot</div>
            Fill in the request and run a review. The Copilot checks coding,
            documentation and medical-necessity criteria, predicts the likely payer
            outcome, and flags fixes <em>before</em> you submit.
          </div>
        </ng-template>
      </div>
    </div>

    <div class="toast" *ngIf="toast">{{ toast }}</div>
  `
})
export class ProviderComponent {
  req: Partial<AuthorizationRequest> = this.blank();
  review: CopilotReview | null = null;
  loading = false;
  submitting = false;
  toast = '';

  constructor(private api: ApiService) {}

  blank(): Partial<AuthorizationRequest> {
    return {
      patientName: '', payerName: '', providerName: '', priority: 'NORMAL',
      diagnoses: [{ icd10Code: '', description: '', isPrincipal: true }],
      serviceLines: [{ cptCode: '', description: '', units: 1 }]
    };
  }

  addDx() { this.req.diagnoses!.push({ icd10Code: '', description: '', isPrincipal: false }); }
  removeDx(i: number) { this.req.diagnoses!.splice(i, 1); }
  addSvc() { this.req.serviceLines!.push({ cptCode: '', description: '', units: 1 }); }
  removeSvc(i: number) { this.req.serviceLines!.splice(i, 1); }

  runCopilot() {
    this.loading = true;
    this.api.copilotReview(this.req).subscribe({
      next: (r) => { this.review = r; this.loading = false; },
      error: () => { this.loading = false; this.flash('Copilot review failed — is the backend running?'); }
    });
  }

  submit() {
    if (!this.req.patientName || !this.req.payerName || !this.req.providerName) {
      this.flash('Patient, payer and provider are required.'); return;
    }
    this.submitting = true;
    this.api.submit(this.req).subscribe({
      next: (saved) => {
        this.submitting = false;
        this.flash(`Submitted as ${saved.reference} — sent to ${saved.payerName}.`);
        this.req = this.blank();
        this.review = null;
      },
      error: () => { this.submitting = false; this.flash('Submit failed — is the backend running?'); }
    });
  }

  scoreColor(s: number) { return s >= 80 ? 'var(--green)' : s >= 60 ? 'var(--amber)' : 'var(--coral)'; }
  outcomeClass(o: string) {
    return o === 'LIKELY_APPROVE' ? 'st-APPROVED' : o === 'UNCERTAIN' ? 'st-PENDING_REVIEW' : 'st-DENIED';
  }
  outcomeLabel(o: string) {
    return o === 'LIKELY_APPROVE' ? 'Likely approve' : o === 'UNCERTAIN' ? 'Uncertain' : 'Likely deny';
  }

  private flash(msg: string) { this.toast = msg; setTimeout(() => (this.toast = ''), 3600); }

  loadSample(kind: 'clean' | 'gaps') {
    this.review = null;
    if (kind === 'clean') {
      this.req = {
        patientName: 'Eleanor Whitfield', patientMrn: 'MRN-44821',
        patientBirthDate: '1968-03-12', patientGender: 'female',
        payerName: 'Meridian Health Plan', planName: 'Meridian PPO Gold', memberId: 'BCBS-7781204',
        providerName: 'Dr. Anil Rao', providerOrg: 'Lakeshore Orthopedics', providerNpi: '1487659302',
        providerSpecialty: 'Orthopedic Surgery', priority: 'NORMAL',
        placeOfService: 'Outpatient Hospital', serviceStart: '2026-06-20',
        clinicalNotes: 'Chronic low back pain 5 months. Completed 8 weeks of physical therapy and NSAIDs without relief. Positive straight-leg raise. MRI requested to evaluate for disc herniation prior to surgical consult.',
        diagnoses: [
          { icd10Code: 'M54.16', description: 'Radiculopathy, lumbar region', isPrincipal: true },
          { icd10Code: 'M51.26', description: 'Intervertebral disc displacement, lumbar', isPrincipal: false }
        ],
        serviceLines: [{ cptCode: '72148', description: 'MRI lumbar spine without contrast', units: 1, unitType: 'study' }]
      };
    } else {
      this.req = {
        patientName: 'Sofia Ahmed', patientMrn: 'MRN-61290',
        patientBirthDate: '1990-07-21', patientGender: 'female',
        payerName: 'UnitedHealthcare', planName: 'Navigate HMO', memberId: 'UHC-5567102',
        providerName: 'Dr. James Holloway', providerOrg: 'Riverside Neurology', providerNpi: '1773450988',
        providerSpecialty: 'Neurology', priority: 'URGENT',
        placeOfService: '', serviceStart: '',
        clinicalNotes: 'Headaches.',
        diagnoses: [{ icd10Code: 'R51.9', description: 'Headache, unspecified', isPrincipal: true }],
        serviceLines: [{ cptCode: '70551', description: 'MRI brain without contrast', units: 1, unitType: 'study' }]
      };
    }
  }
}
