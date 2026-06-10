import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RequestService } from '../../../core/services/request.service';
import { AuthService } from '../../../core/services/auth.service';
import { AuthorizationRequest, RequestStatus } from '../../../core/models/models';
import { PriorityBadgeComponent } from '../priority-badge/priority-badge.component';

interface KanbanColumn {
  status: RequestStatus;
  label:  string;
  icon:   string;
  color:  string;
  items:  AuthorizationRequest[];
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, RouterLink, PriorityBadgeComponent],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {
  loading = signal(true);

  columns = signal<KanbanColumn[]>([
    { status: 'DRAFT',          label: 'Draft',          icon: 'edit_note',       color: 'col-gray',    items: [] },
    { status: 'SUBMITTED',      label: 'Submitted',      icon: 'send',            color: 'col-blue',    items: [] },
    { status: 'IN_REVIEW',      label: 'In Review',      icon: 'rate_review',     color: 'col-yellow',  items: [] },
    { status: 'INFO_REQUESTED', label: 'Info Requested', icon: 'help_outline',    color: 'col-orange',  items: [] },
    { status: 'RESUBMITTED',    label: 'Resubmitted',    icon: 'replay',          color: 'col-cyan',    items: [] },
    { status: 'APPROVED',       label: 'Approved',       icon: 'check_circle',    color: 'col-green',   items: [] },
    { status: 'DENIED',         label: 'Denied',         icon: 'cancel',          color: 'col-red',     items: [] },
  ]);

  readonly isProvider = this.auth.isProvider;

  constructor(
    private requestSvc: RequestService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const statuses: RequestStatus[] = [
      'DRAFT', 'SUBMITTED', 'IN_REVIEW',
      'INFO_REQUESTED', 'RESUBMITTED', 'APPROVED', 'DENIED'
    ];

    let completed = 0;

    statuses.forEach(status => {
      this.requestSvc.getRequestsByStatus(status).subscribe({
        next: items => {
          this.columns.update(cols =>
            cols.map(c => c.status === status ? { ...c, items } : c)
          );
          completed++;
          if (completed === statuses.length) this.loading.set(false);
        },
        error: () => {
          completed++;
          if (completed === statuses.length) this.loading.set(false);
        }
      });
    });
  }

  detailRoute(req: AuthorizationRequest): string {
    const base = this.isProvider() ? '/provider' : '/payer';
    if (!this.isProvider() && this.isActionable(req)) return `/payer/queue/${req.id}`;
    return `${base}/requests/${req.id}`;
  }

  isActionable(req: AuthorizationRequest): boolean {
    return req.status === 'SUBMITTED' || req.status === 'RESUBMITTED' || req.status === 'IN_REVIEW';
  }

  totalCards(): number {
    return this.columns().reduce((sum, c) => sum + c.items.length, 0);
  }
}
