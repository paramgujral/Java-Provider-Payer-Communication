import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthorizationService } from '../../services/authorization.service';
import { AuthorizationCase, PayerDashboard } from '../../models/models';

@Component({
  selector: 'app-payer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="payer-dash">
      <!-- Stats row -->
      <div class="grid-4" style="margin-bottom:24px" *ngIf="stats">
        <div class="kpi-card">
          <span class="kpi-icon">📥</span>
          <span class="kpi-label">Total Submitted</span>
          <span class="kpi-value">{{ stats.totalSubmitted }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon">⏳</span>
          <span class="kpi-label">Pending Review</span>
          <span class="kpi-value" style="color:var(--accent-yellow)">{{ stats.pendingReview }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon">🔴</span>
          <span class="kpi-label">High Risk (AI)</span>
          <span class="kpi-value" style="color:var(--accent-red)">{{ stats.highRisk }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon">✅</span>
          <span class="kpi-label">Finalized</span>
          <span class="kpi-value" style="color:var(--accent-green)">{{ stats.finalized }}</span>
        </div>
      </div>

      <!-- Split screen: Queue + Detail -->
      <div class="split-screen">
        <!-- LEFT: Queue -->
        <div class="queue-panel card">
          <div class="card-header">
            <h3>📋 Review Queue</h3>
            <div class="filter-row">
              <select [(ngModel)]="filterRisk" (ngModelChange)="applyFilter()" class="filter-select">
                <option value="">All Risk</option>
                <option value="RED">🔴 High</option>
                <option value="YELLOW">🟡 Medium</option>
                <option value="GREEN">🟢 Low</option>
              </select>
            </div>
          </div>

          <div *ngIf="loadingQueue" class="loading-state">
            <div class="spinner"></div>
          </div>

          <div class="queue-list" *ngIf="!loadingQueue">
            <div *ngFor="let c of filteredCases"
                 class="queue-item"
                 [class.selected]="selectedCase?.caseId === c.caseId"
                 [class.high-risk]="c.aiRiskLevel === 'RED'"
                 (click)="selectCase(c)">
              <div class="qi-top">
                <code class="qi-id">{{ c.caseId }}</code>
                <span class="risk-badge" [class]="c.aiRiskLevel">{{ c.aiRiskScore }}%</span>
              </div>
              <div class="qi-patient">{{ c.patientName }}</div>
              <div class="qi-codes">
                <code>{{ c.icd10Code }}</code> · <code>{{ c.cptCode }}</code>
              </div>
              <div class="qi-bottom">
                <span class="status-badge" [class]="c.status">{{ formatStatus(c.status) }}</span>
                <span class="qi-date">{{ formatDate(c.updatedAt) }}</span>
              </div>
            </div>
            <div *ngIf="filteredCases.length === 0" class="empty-state">
              <p>No cases in queue</p>
            </div>
          </div>
        </div>

        <!-- RIGHT: Case Detail Preview -->
        <div class="detail-panel card" *ngIf="selectedCase; else noSelection">
          <div class="detail-header">
            <div>
              <h3>{{ selectedCase.patientName }}</h3>
              <code class="case-id-tag">{{ selectedCase.caseId }}</code>
            </div>
            <div class="detail-actions">
              <a [routerLink]="['/case', selectedCase.caseId]" class="btn btn-secondary btn-sm">Full View →</a>
            </div>
          </div>

          <!-- AI Risk -->
          <div class="ai-panel" style="margin-bottom:16px">
            <div class="ai-header">
              <span class="ai-icon">🤖</span>
              <h4>AI Risk Assessment</h4>
              <span class="risk-badge" [class]="selectedCase.aiRiskLevel">
                {{ selectedCase.aiRiskScore }}% {{ selectedCase.aiRiskLevel }}
              </span>
            </div>
            <div class="ai-score-bar">
              <div class="ai-score-fill" [class]="selectedCase.aiRiskLevel"
                   [style.width.%]="selectedCase.aiRiskScore"></div>
            </div>
            <p style="font-size:12px;color:var(--text-secondary);margin:8px 0 0">{{ selectedCase.aiAnalysis }}</p>
          </div>

          <!-- FHIR Fields -->
          <div class="fhir-grid">
            <div class="fhir-field"><span class="ff-label">ICD-10</span><code class="ff-val">{{ selectedCase.icd10Code }}</code></div>
            <div class="fhir-field"><span class="ff-label">CPT</span><code class="ff-val">{{ selectedCase.cptCode }}</code></div>
            <div class="fhir-field"><span class="ff-label">NPI</span><code class="ff-val">{{ selectedCase.npiNumber }}</code></div>
            <div class="fhir-field"><span class="ff-label">Member ID</span><code class="ff-val">{{ selectedCase.patientMemberId }}</code></div>
            <div class="fhir-field"><span class="ff-label">Insurance</span><span class="ff-val">{{ selectedCase.insurancePlan }}</span></div>
            <div class="fhir-field"><span class="ff-label">Urgency</span>
              <span class="ff-val" [class.urgent]="selectedCase.urgencyLevel !== 'ROUTINE'">{{ selectedCase.urgencyLevel }}</span>
            </div>
          </div>

          <div class="clinical-notes-box" *ngIf="selectedCase.clinicalNotes">
            <span class="ff-label">Clinical Notes</span>
            <p>{{ selectedCase.clinicalNotes }}</p>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions" *ngIf="canReview">
            <h4>Quick Decision</h4>
            <div class="action-row">
              <button class="btn btn-success" (click)="quickAction('APPROVED')" [disabled]="reviewing">
                ✅ Approve
              </button>
              <button class="btn btn-danger" (click)="quickAction('DENIED')" [disabled]="reviewing">
                ❌ Deny
              </button>
              <button class="btn btn-warning" (click)="showInfoModal = true" [disabled]="reviewing">
                ❓ Request Info
              </button>
            </div>
            <textarea *ngIf="quickNotes !== null" [(ngModel)]="quickNotes"
                      placeholder="Add payer notes (optional)..." rows="3" style="margin-top:10px;width:100%"></textarea>
            <div *ngIf="reviewMsg" class="review-msg" [class.success]="reviewSuccess" [class.error]="!reviewSuccess">
              {{ reviewMsg }}
            </div>
          </div>
        </div>

        <ng-template #noSelection>
          <div class="no-selection card">
            <div class="no-sel-content">
              <span style="font-size:48px">📋</span>
              <p>Select a case from the queue to review</p>
            </div>
          </div>
        </ng-template>
      </div>
    </div>

    <!-- Info Request Modal -->
    <div class="modal-overlay" *ngIf="showInfoModal" (click)="showInfoModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3 style="margin:0 0 16px">Request Additional Information</h3>
        <div class="form-group" style="margin-bottom:16px">
          <label>Clarification Requested</label>
          <textarea [(ngModel)]="clarificationText" rows="4"
                    placeholder="Specify what additional information is needed..."></textarea>
        </div>
        <div class="form-group" style="margin-bottom:20px">
          <label>Payer Notes</label>
          <textarea [(ngModel)]="quickNotes" rows="3" placeholder="Internal payer notes..."></textarea>
        </div>
        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button class="btn btn-secondary" (click)="showInfoModal = false">Cancel</button>
          <button class="btn btn-warning" (click)="submitInfoRequest()" [disabled]="reviewing">
            Send Request
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payer-dash { max-width: 1300px; }
    .split-screen { display: grid; grid-template-columns: 340px 1fr; gap: 20px; align-items: start; }
    .queue-panel { padding: 16px; }
    .filter-row { display: flex; gap: 8px; }
    .filter-select { background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 12px; padding: 4px 8px; cursor: pointer; }
    .loading-state { display: flex; align-items: center; gap: 10px; padding: 20px; }
    .queue-list { max-height: calc(100vh - 300px); overflow-y: auto; margin: 0 -16px; padding: 0 16px; }
    .queue-item {
      padding: 12px; border-radius: var(--radius-md); margin-bottom: 6px;
      border: 1px solid var(--border-color); cursor: pointer; transition: all 0.15s;
      &:hover { border-color: var(--accent-blue); background: rgba(88,166,255,0.04); }
      &.selected { border-color: var(--accent-blue); background: rgba(88,166,255,0.08); }
      &.high-risk { border-left: 3px solid var(--accent-red); }
    }
    .qi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .qi-id { font-size: 11px; color: var(--accent-blue); }
    .qi-patient { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 3px; }
    .qi-codes { font-size: 11px; color: var(--text-muted); margin-bottom: 6px; code { font-size: 11px; } }
    .qi-bottom { display: flex; align-items: center; justify-content: space-between; }
    .qi-date { font-size: 10px; color: var(--text-muted); }
    .empty-state { text-align: center; padding: 32px 16px; color: var(--text-muted); font-size: 13px; }
    .no-selection { display: flex; align-items: center; justify-content: center; min-height: 400px; }
    .no-sel-content { text-align: center; color: var(--text-muted); font-size: 13px; }
    .detail-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px;
      h3 { margin: 0 0 4px; font-size: 16px; }
    }
    .case-id-tag { font-size: 12px; color: var(--accent-blue); }
    .fhir-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
    .fhir-field { background: var(--bg-tertiary); border-radius: var(--radius-sm); padding: 8px 10px;
      display: flex; flex-direction: column; gap: 2px;
    }
    .ff-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .ff-val { font-size: 13px; color: var(--text-primary);
      &.urgent { color: var(--accent-red); font-weight: 600; }
    }
    code.ff-val { color: var(--accent-blue); font-size: 12px; }
    .clinical-notes-box { background: var(--bg-tertiary); border-radius: var(--radius-md); padding: 12px; margin-bottom: 16px;
      p { margin: 6px 0 0; font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    }
    .quick-actions { border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 8px;
      h4 { margin: 0 0 12px; font-size: 13px; font-weight: 600; }
    }
    .action-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .review-msg { margin-top: 10px; padding: 8px 12px; border-radius: var(--radius-md); font-size: 13px;
      &.success { background: rgba(63,185,80,0.1); color: var(--accent-green); }
      &.error   { background: rgba(248,81,73,0.1); color: var(--accent-red); }
    }
  `]
})
export class PayerDashboardComponent implements OnInit {
  stats: PayerDashboard | null = null;
  cases: AuthorizationCase[] = [];
  filteredCases: AuthorizationCase[] = [];
  selectedCase: AuthorizationCase | null = null;
  loadingQueue = true;
  reviewing = false;
  filterRisk = '';
  quickNotes: string | null = null;
  clarificationText = '';
  showInfoModal = false;
  reviewMsg = '';
  reviewSuccess = false;

  constructor(private authorizationService: AuthorizationService) {}

  ngOnInit(): void {
    this.authorizationService.getPayerDashboard().subscribe(s => this.stats = s);
    this.authorizationService.getPayerCases().subscribe({
      next: cases => {
        this.cases = cases;
        this.filteredCases = cases;
        this.loadingQueue = false;
        if (cases.length > 0) this.selectCase(cases[0]);
      },
      error: () => { this.loadingQueue = false; }
    });
  }

  selectCase(c: AuthorizationCase): void {
    this.authorizationService.getCase(c.caseId).subscribe(full => {
      this.selectedCase = full;
      this.quickNotes = null;
      this.reviewMsg = '';
    });
  }

  applyFilter(): void {
    this.filteredCases = this.filterRisk
      ? this.cases.filter(c => c.aiRiskLevel === this.filterRisk)
      : this.cases;
  }

  quickAction(decision: string): void {
    if (!this.selectedCase) return;
    if (this.quickNotes === null) { this.quickNotes = ''; return; }
    this.reviewing = true;
    this.authorizationService.review(this.selectedCase.caseId, decision, this.quickNotes || '').subscribe({
      next: updated => {
        this.reviewing = false;
        this.selectedCase = updated;
        this.reviewMsg = `Decision recorded: ${decision}`;
        this.reviewSuccess = true;
        this.cases = this.cases.map(c => c.caseId === updated.caseId ? updated : c);
        this.applyFilter();
      },
      error: err => {
        this.reviewing = false;
        this.reviewMsg = err.error?.error || 'Action failed.';
        this.reviewSuccess = false;
      }
    });
  }

  submitInfoRequest(): void {
    if (!this.selectedCase) return;
    this.reviewing = true;
    this.authorizationService.review(this.selectedCase.caseId, 'INFO_REQUESTED',
      this.quickNotes || '', this.clarificationText).subscribe({
      next: updated => {
        this.reviewing = false;
        this.selectedCase = updated;
        this.showInfoModal = false;
        this.reviewMsg = 'Info request sent to provider.';
        this.reviewSuccess = true;
        this.cases = this.cases.map(c => c.caseId === updated.caseId ? updated : c);
        this.applyFilter();
      },
      error: () => { this.reviewing = false; }
    });
  }

  get canReview(): boolean {
    return !!this.selectedCase &&
      (this.selectedCase.status === 'TRANSMITTED' || this.selectedCase.status === 'PAYER_REVIEW');
  }

  formatStatus(status: string): string { return (status || '').replace('_', ' '); }
  formatDate(ts: string): string { return ts ? new Date(ts).toLocaleDateString() : '—'; }
}
