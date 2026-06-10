import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RequestService } from '../../../core/services/request.service';
import { AuthorizationRequest, AiAnalysis, AuditLog } from '../../../core/models/models';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../shared/priority-badge/priority-badge.component';

type DecisionMode = 'none' | 'approve' | 'deny' | 'info';

@Component({
  selector: 'app-review-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, StatusBadgeComponent, PriorityBadgeComponent],
  templateUrl: './review-detail.component.html',
  styleUrls: ['./review-detail.component.scss']
})
export class ReviewDetailComponent implements OnInit {
  request    = signal<AuthorizationRequest | null>(null);
  aiAnalysis = signal<AiAnalysis | null>(null);
  auditLogs  = signal<AuditLog[]>([]);
  loading    = signal(true);
  saving     = signal(false);
  error      = signal('');
  success    = signal('');
  mode       = signal<DecisionMode>('none');
  reviewStarted = signal(false);

  approveForm!: FormGroup;
  denyForm!: FormGroup;
  infoForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private requestSvc: RequestService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.buildForms();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.requestSvc.getRequestById(id).subscribe({
      next: req => {
        this.request.set(req);
        this.loading.set(false);
        this.loadAi(id);
        this.loadAudit(id);
        // Auto-start review if SUBMITTED or RESUBMITTED
        if (req.status === 'SUBMITTED' || req.status === 'RESUBMITTED') {
          this.startReview();
        } else if (req.status === 'IN_REVIEW') {
          this.reviewStarted.set(true);
        }
      },
      error: () => { this.loading.set(false); this.error.set('Request not found.'); }
    });
  }

  private buildForms(): void {
    this.approveForm = this.fb.group({
      reviewerNotes: ['']
    });
    this.denyForm = this.fb.group({
      denialReason:  ['', Validators.required],
      reviewerNotes: ['']
    });
    this.infoForm = this.fb.group({
      additionalInfoRequested: ['', Validators.required],
      reviewerNotes:           ['']
    });
  }

  private loadAi(id: number): void {
    this.requestSvc.getAiAnalysis(id).subscribe(ai => this.aiAnalysis.set(ai));
  }

  private loadAudit(id: number): void {
    this.requestSvc.getAuditTimeline(id).subscribe(logs => this.auditLogs.set(logs));
  }

  startReview(): void {
    const id = this.request()!.id;
    this.requestSvc.startReview(id).subscribe({
      next: updated => {
        this.request.set(updated);
        this.reviewStarted.set(true);
      }
    });
  }

  setMode(m: DecisionMode): void {
    this.mode.set(this.mode() === m ? 'none' : m);
    this.error.set('');
  }

  approve(): void {
    if (!confirm('Confirm approval of this authorization request? This action will notify the provider.')) return;
    this.saving.set(true);
    this.error.set('');
    this.requestSvc.processDecision(this.request()!.id, {
      decision: 'APPROVE',
      reviewerNotes: this.approveForm.value.reviewerNotes
    }).subscribe({
      next: updated => {
        this.request.set(updated);
        this.mode.set('none');
        this.saving.set(false);
        this.success.set('Request approved successfully. The provider has been notified.');
        this.loadAudit(updated.id);
      },
      error: err => {
        this.error.set(err.error?.error || 'Failed to approve request.');
        this.saving.set(false);
      }
    });
  }

  deny(): void {
    if (this.denyForm.invalid) { this.denyForm.markAllAsTouched(); return; }
    if (!confirm('Confirm denial of this authorization request? The provider will be notified with your denial reason.')) return;
    this.saving.set(true);
    this.error.set('');
    this.requestSvc.processDecision(this.request()!.id, {
      decision: 'DENY',
      denialReason:  this.denyForm.value.denialReason,
      reviewerNotes: this.denyForm.value.reviewerNotes
    }).subscribe({
      next: updated => {
        this.request.set(updated);
        this.mode.set('none');
        this.saving.set(false);
        this.success.set('Request denied. The provider has been notified.');
        this.loadAudit(updated.id);
      },
      error: err => {
        this.error.set(err.error?.error || 'Failed to deny request.');
        this.saving.set(false);
      }
    });
  }

  requestInfo(): void {
    if (this.infoForm.invalid) { this.infoForm.markAllAsTouched(); return; }
    this.saving.set(true);
    this.error.set('');
    this.requestSvc.processDecision(this.request()!.id, {
      decision: 'REQUEST_INFO',
      additionalInfoRequested: this.infoForm.value.additionalInfoRequested,
      reviewerNotes:           this.infoForm.value.reviewerNotes
    }).subscribe({
      next: updated => {
        this.request.set(updated);
        this.mode.set('none');
        this.saving.set(false);
        this.success.set('Information request sent to the provider.');
        this.loadAudit(updated.id);
      },
      error: err => {
        this.error.set(err.error?.error || 'Failed to request information.');
        this.saving.set(false);
      }
    });
  }

  isResolved(): boolean {
    const s = this.request()?.status;
    return s === 'APPROVED' || s === 'DENIED' || s === 'INFO_REQUESTED';
  }

  scoreClass(score: number): string {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  }

  auditIcon(action: string): string {
    const map: Record<string, string> = {
      CREATED: 'add_circle', SUBMITTED: 'send', REVIEWED: 'visibility',
      APPROVED: 'check_circle', DENIED: 'cancel',
      RESUBMITTED: 'replay', INFO_REQUESTED: 'info'
    };
    return map[action] ?? 'radio_button_unchecked';
  }

  auditColor(action: string): string {
    const m: Record<string, string> = {
      APPROVED: 'green', DENIED: 'red', INFO_REQUESTED: 'orange',
      SUBMITTED: 'blue', RESUBMITTED: 'blue', CREATED: 'gray', REVIEWED: 'cyan'
    };
    return m[action] ?? 'gray';
  }

  waitDays(): number {
    if (!this.request()?.createdAt) return 0;
    return Math.floor((Date.now() - new Date(this.request()!.createdAt).getTime()) / 86400000);
  }
}
