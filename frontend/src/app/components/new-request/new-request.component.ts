import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthorizationService } from '../../services/authorization.service';
import { AuthService } from '../../services/auth.service';
import { AiAnalysisResult, AuthorizationRequest } from '../../models/models';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-new-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="new-request-layout">
      <!-- LEFT: Form -->
      <div class="form-panel">
        <h3 class="section-title">📄 FHIR Claim – Authorization Request</h3>

        <!-- Patient Demographics -->
        <div class="form-section">
          <h4 class="form-section-title">Patient Demographics</h4>
          <div class="grid-2">
            <div class="form-group">
              <label>Patient Full Name *</label>
              <input [(ngModel)]="form.patientName" (ngModelChange)="onFormChange()" placeholder="John Doe">
            </div>
            <div class="form-group">
              <label>Date of Birth *</label>
              <input [(ngModel)]="form.patientDob" (ngModelChange)="onFormChange()" type="date">
            </div>
            <div class="form-group">
              <label>Gender</label>
              <select [(ngModel)]="form.patientGender" (ngModelChange)="onFormChange()">
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Member ID *</label>
              <input [(ngModel)]="form.patientMemberId" (ngModelChange)="onFormChange()" placeholder="MBR-123456">
            </div>
          </div>
        </div>

        <!-- Provider Info -->
        <div class="form-section">
          <h4 class="form-section-title">Provider Information</h4>
          <div class="grid-2">
            <div class="form-group">
              <label>NPI Number *</label>
              <input [(ngModel)]="form.npiNumber" (ngModelChange)="onFormChange()"
                     placeholder="10-digit NPI"
                     [class.error]="hasNpiError">
              <span class="field-hint" *ngIf="hasNpiError" style="color:var(--accent-red);font-size:11px">Must be 10 digits</span>
            </div>
            <div class="form-group">
              <label>Provider Name *</label>
              <input [(ngModel)]="form.providerName" (ngModelChange)="onFormChange()"
                     placeholder="Dr. Jane Smith"
                     [value]="authService.currentUser?.fullName">
            </div>
          </div>
        </div>

        <!-- Clinical Information -->
        <div class="form-section">
          <h4 class="form-section-title">Clinical Information</h4>
          <div class="grid-2">
            <div class="form-group">
              <label>ICD-10 Code *</label>
              <input [(ngModel)]="form.icd10Code" (ngModelChange)="onFormChange()"
                     placeholder="e.g. J18.9" style="text-transform:uppercase">
            </div>
            <div class="form-group">
              <label>Diagnosis Description</label>
              <input [(ngModel)]="form.diagnosisDescription" (ngModelChange)="onFormChange()" placeholder="Pneumonia, unspecified organism">
            </div>
            <div class="form-group">
              <label>CPT Code *</label>
              <input [(ngModel)]="form.cptCode" (ngModelChange)="onFormChange()" placeholder="e.g. 99213">
            </div>
            <div class="form-group">
              <label>Procedure Description</label>
              <input [(ngModel)]="form.procedureDescription" (ngModelChange)="onFormChange()" placeholder="Office visit, established patient">
            </div>
          </div>
          <div class="form-group" style="margin-top:12px">
            <label>Clinical Notes *</label>
            <textarea [(ngModel)]="form.clinicalNotes" (ngModelChange)="onFormChange()"
                      rows="5" placeholder="Describe the patient's condition, treatment plan, medical history, prior treatments attempted..."></textarea>
            <span class="field-hint">{{ form.clinicalNotes?.length || 0 }} chars – minimum 50 recommended</span>
          </div>
        </div>

        <!-- Insurance -->
        <div class="form-section">
          <h4 class="form-section-title">Insurance / Coverage</h4>
          <div class="grid-2">
            <div class="form-group">
              <label>Insurance ID *</label>
              <input [(ngModel)]="form.insuranceId" (ngModelChange)="onFormChange()" placeholder="INS-987654">
            </div>
            <div class="form-group">
              <label>Insurance Plan</label>
              <input [(ngModel)]="form.insurancePlan" (ngModelChange)="onFormChange()" placeholder="BlueCross PPO Gold">
            </div>
            <div class="form-group">
              <label>Urgency Level</label>
              <select [(ngModel)]="form.urgencyLevel" (ngModelChange)="onFormChange()">
                <option value="ROUTINE">Routine</option>
                <option value="URGENT">Urgent</option>
                <option value="EMERGENT">Emergent</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <button class="btn btn-secondary" (click)="runAnalysis()" [disabled]="analyzing">
            <span *ngIf="analyzing" class="spinner" style="width:14px;height:14px;border-width:2px"></span>
            🔍 Analyze Only
          </button>
          <button class="btn btn-primary" (click)="saveDraft()" [disabled]="saving">
            <span *ngIf="saving" class="spinner" style="width:14px;height:14px;border-width:2px"></span>
            💾 Save Draft
          </button>
          <button class="btn btn-success" (click)="saveAndSubmit()" [disabled]="saving">
            🚀 Save & Submit
          </button>
        </div>

        <div class="toast success" *ngIf="successMsg" style="position:relative;bottom:0;right:0;margin-top:12px">
          {{ successMsg }}
        </div>
        <div class="toast error" *ngIf="errorMsg" style="position:relative;bottom:0;right:0;margin-top:12px">
          {{ errorMsg }}
        </div>
      </div>

      <!-- RIGHT: AI Copilot -->
      <div class="ai-panel-wrap">
        <div class="ai-copilot-header">
          <span class="ai-pulse"></span>
          <h4>🤖 AI Copilot</h4>
          <span class="ai-status" [class]="aiStatusClass">{{ aiStatusText }}</span>
        </div>

        <ng-container *ngIf="aiResult">
          <!-- Risk Score -->
          <div class="ai-score-section">
            <div class="score-circle" [class]="aiResult.riskLevel">
              <span class="score-num">{{ aiResult.riskScore }}</span>
              <span class="score-pct">%</span>
            </div>
            <div class="score-info">
              <span class="score-label">Risk Score</span>
              <span class="risk-badge" [class]="aiResult.riskLevel">{{ aiResult.riskLevel }}</span>
            </div>
          </div>

          <div class="ai-score-bar-wrap">
            <div class="ai-score-bar-track">
              <div class="ai-score-bar-fill" [class]="aiResult.riskLevel"
                   [style.width.%]="aiResult.riskScore"></div>
            </div>
          </div>

          <!-- Summary -->
          <div class="ai-summary">
            <p>{{ aiResult.analysisSummary }}</p>
          </div>

          <!-- Issues -->
          <div class="ai-issues" *ngIf="aiResult.issues.length > 0">
            <h5>⚠ Issues Found ({{ aiResult.issues.length }})</h5>
            <div *ngFor="let issue of aiResult.issues" class="ai-issue"
                 [class]="getIssueClass(issue)">
              {{ issue }}
            </div>
          </div>

          <!-- Suggestions -->
          <div class="ai-suggestions" *ngIf="aiResult.suggestions.length > 0">
            <h5>💡 Suggestions</h5>
            <div *ngFor="let s of aiResult.suggestions" class="ai-suggestion">
              ✓ {{ s }}
            </div>
          </div>

          <!-- Auto-fix hints -->
          <div class="ai-fixes" *ngIf="hasFixes">
            <h5>🔧 Auto-fix Hints</h5>
            <div *ngFor="let fix of getFixEntries()" class="ai-fix">
              <code>{{ fix[0] }}</code>: {{ fix[1] }}
            </div>
          </div>
        </ng-container>

        <div *ngIf="!aiResult && !analyzing" class="ai-idle">
          <p>Start filling in the form to activate real-time AI validation.</p>
          <p>AI scans: NPI, ICD-10, CPT, clinical notes, demographics.</p>
        </div>

        <div *ngIf="analyzing" class="ai-scanning">
          <div class="spinner"></div>
          <span>Scanning FHIR fields...</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .new-request-layout { display: grid; grid-template-columns: 1fr 360px; gap: 24px; max-width: 1200px; align-items: start; }
    .form-panel { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; }
    .section-title { margin: 0 0 20px; font-size: 15px; font-weight: 600; color: var(--text-primary); }
    .form-section { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--border-color);
      &:last-of-type { border-bottom: none; }
    }
    .form-section-title { margin: 0 0 12px; font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .field-hint { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
    .form-actions { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }

    /* AI Panel */
    .ai-panel-wrap {
      background: var(--bg-card); border: 1px solid rgba(88,166,255,0.2);
      border-radius: var(--radius-lg); padding: 20px;
      position: sticky; top: 24px;
    }
    .ai-copilot-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
      h4 { margin: 0; font-size: 14px; font-weight: 600; flex: 1; }
    }
    .ai-pulse {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--accent-green);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(63,185,80,0.4); }
      50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(63,185,80,0); }
    }
    .ai-status { font-size: 11px; padding: 2px 8px; border-radius: 10px;
      &.scanning { background: rgba(88,166,255,0.15); color: var(--accent-blue); }
      &.done     { background: rgba(63,185,80,0.15);  color: var(--accent-green); }
      &.idle     { background: rgba(139,148,158,0.15); color: var(--text-muted); }
    }

    .ai-score-section { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
    .score-circle {
      width: 64px; height: 64px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; flex-direction: row; align-items: baseline; gap: 1px;
      &.GREEN  { background: rgba(63,185,80,0.1);  border: 2px solid var(--risk-green); }
      &.YELLOW { background: rgba(210,153,34,0.1); border: 2px solid var(--risk-yellow); }
      &.RED    { background: rgba(248,81,73,0.1);  border: 2px solid var(--risk-red); }
    }
    .score-num { font-size: 20px; font-weight: 700; }
    .score-pct { font-size: 11px; }
    .score-info { display: flex; flex-direction: column; gap: 4px; }
    .score-label { font-size: 11px; color: var(--text-muted); }

    .ai-score-bar-track { height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden; margin-bottom: 12px; }
    .ai-score-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease;
      &.GREEN  { background: var(--risk-green); }
      &.YELLOW { background: var(--risk-yellow); }
      &.RED    { background: var(--risk-red); }
    }

    .ai-summary { background: var(--bg-tertiary); border-radius: var(--radius-md); padding: 10px 12px; margin-bottom: 12px;
      p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
    }

    .ai-issues, .ai-suggestions, .ai-fixes { margin-bottom: 12px;
      h5 { margin: 0 0 6px; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    }
    .ai-issue { font-size: 12px; padding: 5px 8px; border-radius: var(--radius-sm); margin-bottom: 4px;
      &.CRITICAL { background: rgba(248,81,73,0.08); color: var(--accent-red); border-left: 2px solid var(--accent-red); }
      &.WARNING  { background: rgba(210,153,34,0.08); color: var(--accent-yellow); border-left: 2px solid var(--accent-yellow); }
      &.INFO     { background: rgba(88,166,255,0.08); color: var(--accent-blue); border-left: 2px solid var(--accent-blue); }
    }
    .ai-suggestion { font-size: 12px; color: var(--accent-green); padding: 3px 0; }
    .ai-fix { font-size: 12px; color: var(--text-secondary); padding: 4px 0;
      code { color: var(--accent-blue); font-size: 11px; }
    }

    .ai-idle { text-align: center; padding: 20px 0; color: var(--text-muted); font-size: 12px;
      p { margin: 0 0 6px; }
    }
    .ai-scanning { display: flex; align-items: center; gap: 10px; padding: 16px 0; color: var(--text-muted); font-size: 13px; }
  `]
})
export class NewRequestComponent implements OnInit {
  form: AuthorizationRequest = {
    patientName: '', patientDob: '', patientGender: '', patientMemberId: '',
    npiNumber: '', providerName: '', icd10Code: '', diagnosisDescription: '',
    cptCode: '', procedureDescription: '', clinicalNotes: '',
    insuranceId: '', insurancePlan: '', urgencyLevel: 'ROUTINE'
  };

  aiResult: AiAnalysisResult | null = null;
  analyzing = false;
  saving = false;
  successMsg = '';
  errorMsg = '';

  private analyzeSubject = new Subject<void>();

  constructor(
    public authService: AuthService,
    private authorizationService: AuthorizationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form.providerName = this.authService.currentUser?.fullName || '';
    this.analyzeSubject.pipe(debounceTime(800), distinctUntilChanged()).subscribe(() => {
      this.runAnalysis();
    });
  }

  onFormChange(): void {
    this.analyzeSubject.next();
  }

  runAnalysis(): void {
    if (!this.form.patientName && !this.form.npiNumber && !this.form.icd10Code) return;
    this.analyzing = true;
    this.authorizationService.analyze(this.form).subscribe({
      next: result => { this.aiResult = result; this.analyzing = false; },
      error: () => { this.analyzing = false; }
    });
  }

  saveDraft(): void {
    this.saving = true; this.errorMsg = ''; this.successMsg = '';
    this.authorizationService.createDraft(this.form).subscribe({
      next: c => {
        this.saving = false;
        this.successMsg = `Draft saved: ${c.caseId}`;
        setTimeout(() => this.router.navigate(['/case', c.caseId]), 1500);
      },
      error: err => { this.saving = false; this.errorMsg = err.error?.error || 'Failed to save draft.'; }
    });
  }

  saveAndSubmit(): void {
    this.saving = true; this.errorMsg = ''; this.successMsg = '';
    this.authorizationService.createDraft(this.form).subscribe({
      next: draft => {
        this.authorizationService.submit(draft.caseId).subscribe({
          next: c => {
            this.saving = false;
            this.successMsg = `Submitted: ${c.caseId}`;
            setTimeout(() => this.router.navigate(['/case', c.caseId]), 1500);
          },
          error: err => { this.saving = false; this.errorMsg = err.error?.error || 'Submission failed.'; }
        });
      },
      error: err => { this.saving = false; this.errorMsg = err.error?.error || 'Failed to create case.'; }
    });
  }

  get hasNpiError(): boolean {
    return !!this.form.npiNumber && !/^\d{10}$/.test(this.form.npiNumber);
  }

  get hasFixes(): boolean {
    return !!this.aiResult && Object.keys(this.aiResult.autoFixSuggestions).length > 0;
  }

  getFixEntries(): [string, string][] {
    return this.aiResult ? Object.entries(this.aiResult.autoFixSuggestions) : [];
  }

  get aiStatusClass(): string {
    if (this.analyzing) return 'scanning';
    if (this.aiResult) return 'done';
    return 'idle';
  }

  get aiStatusText(): string {
    if (this.analyzing) return 'Scanning...';
    if (this.aiResult) return 'Analysis Ready';
    return 'Idle';
  }

  getIssueClass(issue: string): string {
    if (issue.startsWith('CRITICAL')) return 'CRITICAL';
    if (issue.startsWith('WARNING')) return 'WARNING';
    return 'INFO';
  }
}
