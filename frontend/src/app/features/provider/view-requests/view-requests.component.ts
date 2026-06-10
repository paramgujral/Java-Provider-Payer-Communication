import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../../core/services/request.service';
import { AuthorizationRequest, RequestStatus } from '../../../core/models/models';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../shared/priority-badge/priority-badge.component';

@Component({
  selector: 'app-view-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StatusBadgeComponent, PriorityBadgeComponent],
  templateUrl: './view-requests.component.html',
  styleUrls: ['./view-requests.component.scss']
})
export class ViewRequestsComponent implements OnInit {
  requests     = signal<AuthorizationRequest[]>([]);
  loading      = signal(true);
  successMsg   = signal('');
  searchTerm   = '';
  statusFilter = '';
  displayLimit = signal(20);

  get pagedRequests(): AuthorizationRequest[] {
    return this.sortedRequests().slice(0, this.displayLimit());
  }
  get hasMore(): boolean {
    return this.sortedRequests().length > this.displayLimit();
  }
  loadMore(): void { this.displayLimit.update(n => n + 20); }

  readonly statusOptions: { value: string; label: string }[] = [
    { value: '',               label: 'All Statuses' },
    { value: 'DRAFT',          label: 'Draft' },
    { value: 'SUBMITTED',      label: 'Submitted' },
    { value: 'IN_REVIEW',      label: 'In Review' },
    { value: 'INFO_REQUESTED', label: 'Info Requested' },
    { value: 'RESUBMITTED',    label: 'Resubmitted' },
    { value: 'APPROVED',       label: 'Approved' },
    { value: 'DENIED',         label: 'Denied' }
  ];

  constructor(
    private requestSvc: RequestService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('submitted') === 'true') {
      this.successMsg.set('Request submitted successfully! The payer will review it shortly.');
      setTimeout(() => this.successMsg.set(''), 6000);
    }
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const status = this.statusFilter as RequestStatus | undefined;
    this.requestSvc.getMyRequests(
      status || undefined,
      this.searchTerm || undefined
    ).subscribe({
      next: r => { this.requests.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch(): void { this.displayLimit.set(20); this.load(); }
  onFilterChange(): void { this.displayLimit.set(20); this.load(); }
  clearFilters(): void { this.searchTerm = ''; this.statusFilter = ''; this.load(); }

  canSubmit(req: AuthorizationRequest): boolean {
    return req.status === 'DRAFT';
  }
  canResubmit(req: AuthorizationRequest): boolean {
    return req.status === 'INFO_REQUESTED';
  }

  submitRequest(id: number, event: Event): void {
    event.stopPropagation();
    this.requestSvc.submitRequest(id).subscribe({
      next: updated => {
        this.requests.update(list =>
          list.map(r => r.id === updated.id ? updated : r)
        );
        this.successMsg.set('Request submitted successfully!');
        setTimeout(() => this.successMsg.set(''), 4000);
      }
    });
  }

  priorityOrder: Record<string, number> = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };

  sortedRequests(): AuthorizationRequest[] {
    return [...this.requests()].sort((a, b) =>
      (this.priorityOrder[a.priority] ?? 99) - (this.priorityOrder[b.priority] ?? 99)
    );
  }
}
