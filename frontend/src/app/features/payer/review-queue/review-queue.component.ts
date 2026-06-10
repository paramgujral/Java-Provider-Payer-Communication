import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../../core/services/request.service';
import { AuthorizationRequest, RequestStatus } from '../../../core/models/models';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../shared/priority-badge/priority-badge.component';

@Component({
  selector: 'app-review-queue',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StatusBadgeComponent, PriorityBadgeComponent],
  templateUrl: './review-queue.component.html',
  styleUrls: ['./review-queue.component.scss']
})
export class ReviewQueueComponent implements OnInit {
  requests     = signal<AuthorizationRequest[]>([]);
  loading      = signal(true);
  searchTerm   = '';
  statusFilter = '';

  readonly statusOptions = [
    { value: '',               label: 'All Statuses' },
    { value: 'SUBMITTED',      label: 'Submitted' },
    { value: 'RESUBMITTED',    label: 'Resubmitted' },
    { value: 'IN_REVIEW',      label: 'In Review' },
    { value: 'INFO_REQUESTED', label: 'Info Requested' },
    { value: 'APPROVED',       label: 'Approved' },
    { value: 'DENIED',         label: 'Denied' }
  ];

  constructor(private requestSvc: RequestService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    const status = this.statusFilter as RequestStatus | undefined;
    this.requestSvc.getQueue(status || undefined, this.searchTerm || undefined).subscribe({
      next: r => { this.requests.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch(): void { this.load(); }
  onFilterChange(): void { this.load(); }
  clearFilters(): void { this.searchTerm = ''; this.statusFilter = ''; this.load(); }

  waitDays(createdAt: string): number {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
  }

  isActionable(req: AuthorizationRequest): boolean {
    return req.status === 'SUBMITTED' || req.status === 'RESUBMITTED' || req.status === 'IN_REVIEW';
  }

  aiClass(score: number | null): string {
    if (score == null) return '';
    if (score >= 80) return 'ai-high';
    if (score >= 50) return 'ai-medium';
    return 'ai-low';
  }

  prioritySortOrder: Record<string, number> = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };

  sorted(): AuthorizationRequest[] {
    return [...this.requests()].sort((a, b) => {
      // Actionable first
      const aAction = this.isActionable(a) ? 0 : 1;
      const bAction = this.isActionable(b) ? 0 : 1;
      if (aAction !== bAction) return aAction - bAction;
      // Then by priority
      return (this.prioritySortOrder[a.priority] ?? 9) -
             (this.prioritySortOrder[b.priority] ?? 9);
    });
  }
}
