import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthorizationService } from '../../services/authorization.service';
import { CommunicationService } from '../../services/communication.service';
import { AuthService } from '../../services/auth.service';
import { AuthorizationCase, ChatMessage, AiAnalysisResult } from '../../models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="case-detail-layout">
      <!-- Header -->
      <div class="case-header">
        <div class="case-header-left">
          <button class="btn btn-ghost btn-sm" (click)="goBack()">← Back</button>
          <div>
            <h2>{{ aCase?.patientName || '—' }}</h2>
            <div class="case-meta">
              <code class="case-id-tag">{{ aCase?.caseId }}</code>
              <span class="status-badge" [class]="aCase?.status">{{ formatStatus(aCase?.status) }}</span>
              <span class="urgency-chip" [class]="aCase?.urgencyLevel">{{ aCase?.urgencyLevel }}</span>
            </div>
          </div>
        </div>
        <div class="case-header-right" *ngIf="aCase">
          <button class="btn btn-secondary btn-sm" (click)="runAiFix()" [disabled]="runningAi">
            <span *ngIf="runningAi" class="spinner" style="width:12px;height:12px;border-width:2px"></span>
            🤖 Re-run AI
          </button>
          <button class="btn btn-primary btn-sm" *ngIf="aCase.status === 'DRAFT' && isProvider"
                  (click)="submitCase()" [disabled]="submitting">
            🚀 Submit
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state"><div class="spinner"></div><span>Loading case...</span></div>

      <div class="case-body" *ngIf="!loading && aCase">
        <!-- TOP: AI Score + Timeline -->
        <div class="case-top-row">
          <!-- AI Risk Panel -->
          <div class="ai-panel ai-panel-full">
            <div class="ai-header">
              <span class="ai-icon">🤖</span>
              <h4>AI Copilot Analysis</h4>
              <span class="risk-badge" [class]="aCase.aiRiskLevel">
                {{ aCase.aiRiskScore }}% {{ aCase.aiRiskLevel }}
              </span>
            </div>
            <div class="ai-score-bar">
              <div class="ai-score-fill" [class]="aCase.aiRiskLevel"
                   [style.width.%]="aCase.aiRiskScore"></div>
            </div>
            <p class="ai-analysis-text">{{ aCase.aiAnalysis }}</p>

            <ng-container *ngIf="aiFixResult">
              <div class="ai-rerun-results">
                <h5>🔍 Latest AI Scan</h5>
                <div *ngFor="let issue of aiFixResult.issues" class="ai-issue" [class]="getIssueClass(issue)">
                  {{ issue }}
                </div>
                <div *ngFor="let s of aiFixResult.suggestions" class="ai-suggestion">✓ {{ s }}</div>
              </div>
            </ng-container>
          </div>

          <!-- Timeline -->
          <div class="timeline-panel">
            <h4 class="panel-title">📅 Case Timeline</h4>
            <div class="timeline">
              <div class="timeline-item" [class.active]="true">
                <div class="tl-dot draft"></div>
                <div class="tl-content">
                  <span class="tl-label">Created (Draft)</span>
                  <span class="tl-date">{{ formatDateTime(aCase.createdAt) }}</span>
                </div>
              </div>
              <div class="timeline-item" *ngIf="aCase.submittedAt">
                <div class="tl-dot transmitted"></div>
                <div class="tl-content">
                  <span class="tl-label">Transmitted to Payer</span>
                  <span class="tl-date">{{ formatDateTime(aCase.submittedAt) }}</span>
                </div>
              </div>
              <div class="timeline-item" *ngIf="aCase.status === 'PAYER_REVIEW' || aCase.status === 'INFO_REQUESTED' || aCase.status === 'FINALIZED'">
                <div class="tl-dot review"></div>
                <div class="tl-content">
                  <span class="tl-label">Under Payer Review</span>
                </div>
              </div>
              <div class="timeline-item" *ngIf="aCase.status === 'INFO_REQUESTED'">
                <div class="tl-dot info"></div>
                <div class="tl-content">
                  <span class="tl-label">Info Requested</span>
                  <p class="tl-note">{{ aCase.clarificationRequested }}</p>
                </div>
              </div>
              <div class="timeline-item" *ngIf="aCase.status === 'FINALIZED'">
                <div class="tl-dot finalized"></div>
                <div class="tl-content">
                  <span class="tl-label">Finalized – {{ aCase.payerDecision }}</span>
                  <span class="tl-date">{{ formatDateTime(aCase.updatedAt) }}</span>
                  <p class="tl-note" *ngIf="aCase.payerNotes">{{ aCase.payerNotes }}</p>
                </div>
              </div>
            </div>

            <!-- Clarification Response (Provider) -->
            <div class="clarification-box" *ngIf="aCase.status === 'INFO_REQUESTED' && isProvider">
              <h5>Respond to Payer Request</h5>
              <p class="clarif-request">{{ aCase.clarificationRequested }}</p>
              <textarea [(ngModel)]="clarificationResponse" rows="3"
                        placeholder="Provide the requested information..."></textarea>
              <button class="btn btn-primary btn-sm" style="margin-top:8px"
                      (click)="submitClarification()" [disabled]="submitting">
                Submit Response
              </button>
            </div>
          </div>
        </div>

        <!-- MIDDLE: FHIR Fields + Chat -->
        <div class="case-middle-row">
          <!-- FHIR Inspector -->
          <div class="fhir-inspector card">
            <div class="card-header">
              <h3>🔬 FHIR R4 Inspector</h3>
              <span class="fhir-resource-tag">Claim / ClaimResponse</span>
            </div>

            <div class="fhir-section">
              <h5 class="fhir-section-title">Patient (Coverage)</h5>
              <div class="fhir-fields-grid">
                <div class="fhir-row"><span class="fr-key">patient.name</span><span class="fr-val">{{ aCase.patientName }}</span></div>
                <div class="fhir-row"><span class="fr-key">patient.birthDate</span><span class="fr-val">{{ aCase.patientDob }}</span></div>
                <div class="fhir-row"><span class="fr-key">patient.gender</span><span class="fr-val">{{ aCase.patientGender }}</span></div>
                <div class="fhir-row"><span class="fr-key">coverage.memberId</span><span class="fr-val">{{ aCase.patientMemberId }}</span></div>
                <div class="fhir-row"><span class="fr-key">coverage.plan</span><span class="fr-val">{{ aCase.insurancePlan }}</span></div>
                <div class="fhir-row"><span class="fr-key">coverage.insurerId</span><span class="fr-val">{{ aCase.insuranceId }}</span></div>
              </div>
            </div>

            <div class="fhir-section">
              <h5 class="fhir-section-title">Provider</h5>
              <div class="fhir-fields-grid">
                <div class="fhir-row"><span class="fr-key">provider.npi</span><code class="fr-val">{{ aCase.npiNumber }}</code></div>
                <div class="fhir-row"><span class="fr-key">provider.name</span><span class="fr-val">{{ aCase.providerName }}</span></div>
              </div>
            </div>

            <div class="fhir-section">
              <h5 class="fhir-section-title">Claim – Diagnosis & Procedure</h5>
              <div class="fhir-fields-grid">
                <div class="fhir-row"><span class="fr-key">diagnosis.code (ICD-10)</span><code class="fr-val hl">{{ aCase.icd10Code }}</code></div>
                <div class="fhir-row"><span class="fr-key">diagnosis.description</span><span class="fr-val">{{ aCase.diagnosisDescription }}</span></div>
                <div class="fhir-row"><span class="fr-key">procedure.code (CPT)</span><code class="fr-val hl">{{ aCase.cptCode }}</code></div>
                <div class="fhir-row"><span class="fr-key">procedure.description</span><span class="fr-val">{{ aCase.procedureDescription }}</span></div>
                <div class="fhir-row"><span class="fr-key">priority.code</span><span class="fr-val">{{ aCase.urgencyLevel }}</span></div>
              </div>
            </div>

            <div class="fhir-section" *ngIf="aCase.clinicalNotes">
              <h5 class="fhir-section-title">Clinical Notes (supportingInfo)</h5>
              <div class="fhir-notes-box">{{ aCase.clinicalNotes }}</div>
            </div>

            <div class="fhir-section" *ngIf="aCase.payerDecision">
              <h5 class="fhir-section-title">ClaimResponse</h5>
              <div class="fhir-fields-grid">
                <div class="fhir-row"><span class="fr-key">outcome</span>
                  <span class="fr-val" [style.color]="aCase.payerDecision === 'APPROVED' ? 'var(--accent-green)' : 'var(--accent-red)'">
                    {{ aCase.payerDecision }}
                  </span>
                </div>
                <div class="fhir-row" *ngIf="aCase.payerNotes"><span class="fr-key">disposition</span><span class="fr-val">{{ aCase.payerNotes }}</span></div>
              </div>
            </div>
          </div>

          <!-- Chat Window (FHIR Communication) -->
          <div class="chat-panel card">
            <div class="card-header">
              <h3>💬 FHIR Communication</h3>
              <span class="fhir-resource-tag">Communication</span>
            </div>
            <div class="chat-messages" #chatContainer>
              <div *ngFor="let msg of messages" class="chat-msg"
                   [class.mine]="msg.senderUsername === currentUser"
                   [class.system]="msg.messageType === 'SYSTEM' || msg.messageType === 'AI_INSIGHT'">
                <div class="msg-bubble">
                  <div class="msg-header" *ngIf="msg.senderUsername !== currentUser">
                    <span class="msg-sender">{{ msg.senderFullName }}</span>
                    <span class="msg-role-badge" [class]="msg.senderRole.toLowerCase()">{{ msg.senderRole }}</span>
                  </div>
                  <p class="msg-text">{{ msg.messageContent }}</p>
                  <span class="msg-time">{{ formatTime(msg.sentAt) }}</span>
                </div>
              </div>
              <div *ngIf="messages.length === 0" class="chat-empty">
                No messages yet. Start the conversation below.
              </div>
            </div>
            <div class="chat-input-row">
              <input [(ngModel)]="newMessage" (keyup.enter)="sendMessage()"
                     placeholder="Type a message..." class="chat-input">
              <button class="btn btn-primary btn-sm" (click)="sendMessage()" [disabled]="!newMessage.trim() || sending">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .case-detail-layout { max-width: 1300px; }
    .case-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .case-header-left { display: flex; align-items: center; gap: 16px;
      h2 { margin: 0 0 4px; font-size: 18px; }
    }
    .case-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .case-id-tag { font-size: 12px; color: var(--accent-blue); }
    .urgency-chip { font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600;
      background: rgba(139,148,158,0.15); color: var(--text-muted);
      &.URGENT   { background: rgba(210,153,34,0.15); color: var(--accent-yellow); }
      &.EMERGENT { background: rgba(248,81,73,0.15);  color: var(--accent-red); }
    }
    .case-header-right { display: flex; gap: 8px; }
    .loading-state { display: flex; align-items: center; gap: 12px; padding: 40px; color: var(--text-muted); }

    .case-top-row { display: grid; grid-template-columns: 1fr 320px; gap: 20px; margin-bottom: 20px; }
    .ai-panel-full { padding: 16px; }
    .ai-analysis-text { margin: 8px 0 0; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .ai-rerun-results { margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 12px;
      h5 { margin: 0 0 8px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; }
    }
    .ai-issue { font-size: 12px; padding: 4px 8px; border-radius: 4px; margin-bottom: 4px;
      &.CRITICAL { background: rgba(248,81,73,0.08); color: var(--accent-red); }
      &.WARNING  { background: rgba(210,153,34,0.08); color: var(--accent-yellow); }
      &.INFO     { background: rgba(88,166,255,0.08); color: var(--accent-blue); }
    }
    .ai-suggestion { font-size: 12px; color: var(--accent-green); padding: 2px 0; }

    .timeline-panel { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px; }
    .panel-title { margin: 0 0 16px; font-size: 13px; font-weight: 600; }
    .timeline { display: flex; flex-direction: column; gap: 0; }
    .timeline-item { display: flex; gap: 12px; padding-bottom: 16px; position: relative;
      &:not(:last-child)::before {
        content: ''; position: absolute; left: 7px; top: 18px;
        width: 2px; bottom: 0; background: var(--border-color);
      }
    }
    .tl-dot { width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; margin-top: 2px;
      &.draft       { background: var(--status-draft); }
      &.transmitted { background: var(--status-transmitted); }
      &.review      { background: var(--status-review); }
      &.info        { background: var(--status-info); }
      &.finalized   { background: var(--status-finalized); }
    }
    .tl-content { display: flex; flex-direction: column; gap: 2px; }
    .tl-label { font-size: 13px; font-weight: 500; color: var(--text-primary); }
    .tl-date  { font-size: 11px; color: var(--text-muted); }
    .tl-note  { margin: 4px 0 0; font-size: 12px; color: var(--text-secondary); font-style: italic; }

    .clarification-box { border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 8px;
      h5 { margin: 0 0 8px; font-size: 12px; color: var(--accent-yellow); }
      .clarif-request { font-size: 12px; color: var(--text-secondary); font-style: italic; margin: 0 0 10px; }
    }

    .case-middle-row { display: grid; grid-template-columns: 1fr 380px; gap: 20px; }

    /* FHIR Inspector */
    .fhir-inspector { }
    .fhir-resource-tag { font-size: 11px; background: rgba(88,166,255,0.1); color: var(--accent-blue); padding: 3px 8px; border-radius: 4px; }
    .fhir-section { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);
      &:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    }
    .fhir-section-title { margin: 0 0 8px; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .fhir-fields-grid { display: flex; flex-direction: column; gap: 6px; }
    .fhir-row { display: flex; align-items: baseline; gap: 8px; font-size: 12px; }
    .fr-key { font-family: monospace; font-size: 11px; color: var(--accent-blue); min-width: 220px; flex-shrink: 0; }
    .fr-val { color: var(--text-primary); &.hl { color: var(--accent-yellow); font-weight: 600; } }
    .fhir-notes-box { background: var(--bg-tertiary); border-radius: var(--radius-md); padding: 12px; font-size: 12px; color: var(--text-secondary); line-height: 1.7; }

    /* Chat */
    .chat-panel { display: flex; flex-direction: column; padding: 0; overflow: hidden; }
    .chat-panel .card-header { padding: 16px 16px 12px; border-bottom: 1px solid var(--border-color); }
    .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; max-height: 480px; min-height: 200px; }
    .chat-empty { text-align: center; padding: 24px; color: var(--text-muted); font-size: 12px; }
    .chat-msg { display: flex;
      &.mine { justify-content: flex-end; }
      &.system { justify-content: center; }
    }
    .msg-bubble { max-width: 80%; background: var(--bg-tertiary); border-radius: var(--radius-md); padding: 10px 12px;
      .mine & { background: rgba(88,166,255,0.15); border-radius: var(--radius-md) var(--radius-md) 2px var(--radius-md); }
      .system & { background: rgba(63,185,80,0.08); border: 1px solid rgba(63,185,80,0.2); text-align: center; }
    }
    .msg-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    .msg-sender { font-size: 11px; font-weight: 600; color: var(--text-secondary); }
    .msg-role-badge { font-size: 9px; padding: 1px 6px; border-radius: 8px;
      &.provider { background: rgba(88,166,255,0.15); color: var(--accent-blue); }
      &.payer    { background: rgba(63,185,80,0.15);  color: var(--accent-green); }
    }
    .msg-text { margin: 0 0 4px; font-size: 13px; color: var(--text-primary); line-height: 1.5; }
    .msg-time { font-size: 10px; color: var(--text-muted); }
    .chat-input-row { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border-color); }
    .chat-input { flex: 1; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 8px 12px; font-size: 13px; color: var(--text-primary); &:focus { border-color: var(--accent-blue); outline: none; } }
  `]
})
export class CaseDetailComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  aCase: AuthorizationCase | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  loading = true;
  submitting = false;
  sending = false;
  runningAi = false;
  aiFixResult: AiAnalysisResult | null = null;
  clarificationResponse = '';
  private wsSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authorizationService: AuthorizationService,
    private communicationService: CommunicationService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const caseId = this.route.snapshot.paramMap.get('caseId')!;
    this.authorizationService.getCase(caseId).subscribe({
      next: c => { this.aCase = c; this.loading = false; this.loadMessages(caseId); this.connectWs(caseId); },
      error: () => { this.loading = false; }
    });
  }

  ngOnDestroy(): void {
    this.communicationService.disconnect();
    this.wsSubscription?.unsubscribe();
  }

  loadMessages(caseId: string): void {
    this.communicationService.getMessages(caseId).subscribe(msgs => {
      this.messages = msgs;
      this.scrollChat();
    });
  }

  connectWs(caseId: string): void {
    this.communicationService.connectToCase(caseId);
    this.wsSubscription = this.communicationService.messages$.subscribe(msg => {
      if (!this.messages.find(m => m.id === msg.id)) {
        this.messages.push(msg);
        this.scrollChat();
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.aCase) return;
    this.sending = true;
    this.communicationService.sendMessage(this.aCase.caseId, this.newMessage).subscribe({
      next: msg => {
        this.sending = false;
        this.newMessage = '';
        if (!this.messages.find(m => m.id === msg.id)) {
          this.messages.push(msg);
          this.scrollChat();
        }
      },
      error: () => { this.sending = false; }
    });
  }

  submitCase(): void {
    if (!this.aCase) return;
    this.submitting = true;
    this.authorizationService.submit(this.aCase.caseId).subscribe({
      next: c => { this.aCase = c; this.submitting = false; },
      error: () => { this.submitting = false; }
    });
  }

  runAiFix(): void {
    if (!this.aCase) return;
    this.runningAi = true;
    this.authorizationService.aiFix(this.aCase.caseId).subscribe({
      next: result => { this.aiFixResult = result; this.runningAi = false; },
      error: () => { this.runningAi = false; }
    });
  }

  submitClarification(): void {
    if (!this.aCase || !this.clarificationResponse.trim()) return;
    this.submitting = true;
    this.authorizationService.clarification(this.aCase.caseId, this.clarificationResponse).subscribe({
      next: c => { this.aCase = c; this.submitting = false; this.clarificationResponse = ''; },
      error: () => { this.submitting = false; }
    });
  }

  scrollChat(): void {
    setTimeout(() => {
      if (this.chatContainer?.nativeElement) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }

  goBack(): void {
    this.router.navigate([this.isProvider ? '/provider/dashboard' : '/payer/dashboard']);
  }

  get isProvider(): boolean { return this.authService.isProvider; }
  get currentUser(): string { return this.authService.currentUser?.username || ''; }

  formatStatus(s?: string): string { return (s || '').replace('_', ' '); }

  formatDateTime(ts: string): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleString();
  }

  formatTime(ts: string): string {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getIssueClass(issue: string): string {
    if (issue.startsWith('CRITICAL')) return 'CRITICAL';
    if (issue.startsWith('WARNING')) return 'WARNING';
    return 'INFO';
  }
}
