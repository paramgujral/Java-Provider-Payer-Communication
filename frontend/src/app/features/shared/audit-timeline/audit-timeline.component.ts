import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { RequestService } from '../../../core/services/request.service';
import { AuthService } from '../../../core/services/auth.service';
import { AuthorizationRequest, AuditLog, AuditAction } from '../../../core/models/models';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-audit-timeline',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  templateUrl: './audit-timeline.component.html',
  styleUrls: ['./audit-timeline.component.scss']
})
export class AuditTimelineComponent implements OnInit {
  request   = signal<AuthorizationRequest | null>(null);
  logs      = signal<AuditLog[]>([]);
  loading   = signal(true);
  filter    = signal<AuditAction | 'ALL'>('ALL');

  readonly isProvider = this.auth.isProvider;

  readonly actionFilters: { value: AuditAction | 'ALL'; label: string }[] = [
    { value: 'ALL',           label: 'All Events' },
    { value: 'CREATED',       label: 'Created' },
    { value: 'SUBMITTED',     label: 'Submitted' },
    { value: 'REVIEWED',      label: 'Reviewed' },
    { value: 'APPROVED',      label: 'Approved' },
    { value: 'DENIED',        label: 'Denied' },
    { value: 'INFO_REQUESTED',label: 'Info Requested' },
    { value: 'RESUBMITTED',   label: 'Resubmitted' },
  ];

  filtered = computed(() => {
    const f = this.filter();
    if (f === 'ALL') return this.logs();
    return this.logs().filter(l => l.action === f);
  });

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
      },
      error: () => this.loading.set(false)
    });
    this.requestSvc.getAuditTimeline(id).subscribe(logs => this.logs.set(logs));
  }

  setFilter(f: AuditAction | 'ALL'): void { this.filter.set(f); }

  backRoute(): string {
    const id = this.request()?.id;
    return this.isProvider() ? `/provider/requests/${id}` : `/payer/requests/${id}`;
  }

  dotColor(action: AuditAction): string {
    const m: Partial<Record<AuditAction, string>> = {
      CREATED: 'gray', SUBMITTED: 'blue', REVIEWED: 'cyan',
      APPROVED: 'green', DENIED: 'red',
      INFO_REQUESTED: 'orange', RESUBMITTED: 'blue'
    };
    return m[action] ?? 'gray';
  }

  dotIcon(action: AuditAction): string {
    const m: Partial<Record<AuditAction, string>> = {
      CREATED: 'add_circle', SUBMITTED: 'send', REVIEWED: 'visibility',
      APPROVED: 'check_circle', DENIED: 'cancel',
      INFO_REQUESTED: 'help_outline', RESUBMITTED: 'replay'
    };
    return m[action] ?? 'radio_button_unchecked';
  }

  roleBadgeClass(role: string): string {
    return role === 'PROVIDER' ? 'role-provider' : 'role-payer';
  }

  countByAction(action: AuditAction | 'ALL'): number {
    if (action === 'ALL') return this.logs().length;
    return this.logs().filter(l => l.action === action).length;
  }
}
