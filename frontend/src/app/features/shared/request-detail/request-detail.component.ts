import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RequestService } from '../../../core/services/request.service';
import { AuthService } from '../../../core/services/auth.service';
import { AuthorizationRequest, AuditLog, AiAnalysis } from '../../../core/models/models';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../priority-badge/priority-badge.component';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, PriorityBadgeComponent],
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.scss']
})
export class RequestDetailComponent implements OnInit {
  request   = signal<AuthorizationRequest | null>(null);
  auditLogs = signal<AuditLog[]>([]);
  aiAnalysis = signal<AiAnalysis | null>(null);
  loading   = signal(true);
  activeTab = signal<'details' | 'ai' | 'audit'>('details');

  readonly isProvider = this.auth.isProvider;
  readonly isPayer    = this.auth.isPayer;

  constructor(
    private route: ActivatedRoute,
    private requestSvc: RequestService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.requestSvc.getRequestById(id).subscribe({
      next: req => {
        this.request.set(req);
        this.loading.set(false);
        this.loadAudit(id);
        this.loadAi(id);
      },
      error: () => this.loading.set(false)
    });
  }

  loadAudit(id: number): void {
    this.requestSvc.getAuditTimeline(id).subscribe(logs => this.auditLogs.set(logs));
  }

  loadAi(id: number): void {
    this.requestSvc.getAiAnalysis(id).subscribe(ai => this.aiAnalysis.set(ai));
  }

  setTab(tab: 'details' | 'ai' | 'audit'): void { this.activeTab.set(tab); }

  backRoute(): string {
    return this.isProvider() ? '/provider/requests' : '/payer/queue';
  }

  reviewRoute(): string {
    const id = this.request()?.id;
    return `/payer/queue/${id}`;
  }

  resubmitRoute(): string {
    const id = this.request()?.id;
    return `/provider/requests/${id}/resubmit`;
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
    const map: Record<string, string> = {
      APPROVED: 'green', DENIED: 'red', INFO_REQUESTED: 'orange',
      SUBMITTED: 'blue', RESUBMITTED: 'blue', CREATED: 'gray', REVIEWED: 'cyan'
    };
    return map[action] ?? 'gray';
  }
}
