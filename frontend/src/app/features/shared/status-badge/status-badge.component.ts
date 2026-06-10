import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestStatus } from '../../../core/models/models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="'badge-' + status.toLowerCase()">
      {{ label || statusLabels[status] }}
    </span>
  `
})
export class StatusBadgeComponent {

  @Input() status!: RequestStatus;
  @Input() label?: string;

  readonly statusLabels: Record<RequestStatus, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    IN_REVIEW: 'In Review',
    INFO_REQUESTED: 'Info Requested',
    RESUBMITTED: 'Resubmitted',
    APPROVED: 'Approved',
    DENIED: 'Denied'
  };
}