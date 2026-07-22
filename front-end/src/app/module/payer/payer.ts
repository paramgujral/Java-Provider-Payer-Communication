import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PayerRequest, PayerWorkflowService } from './payer.service';

@Component({
  selector: 'app-payer',
  templateUrl: './payer.html',
  styleUrls: ['./payer.css']
})
export class PayerReviewComponent implements OnInit {
  requests: PayerRequest[] = [];
  loading      = true;
  errorMessage = '';

  showRejectModal  = false;
  rejectingRequest: PayerRequest | null = null;
  rejectionReason  = '';
  selectedRequest: PayerRequest | null = null;

  constructor(
    private payerWorkflowService: PayerWorkflowService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPendingRequests();
    }
  }

  loadPendingRequests(): void {
  this.loading = true;
  this.errorMessage = '';

  this.payerWorkflowService.getPendingRequests().subscribe({
    next: (data) => {
      this.zone.run(() => {
        this.requests = data;
        this.loading  = false;
      });
    },
    error: () => {
      this.zone.run(() => {
        this.errorMessage = 'Failed to load requests';
        this.loading = false;
      });
    }
  });
}
  approveRequest(request: PayerRequest): void {
    this.payerWorkflowService.reviewRequest(request.id, {
      decision: 'APPROVED',
      reviewNotes: 'Approved by payer'
    }).subscribe({
      next: (updated) => {
        request.status = updated.status;
        if (this.selectedRequest && this.selectedRequest.id === request.id) {
          this.selectedRequest.status = updated.status;
        }
      },
      error: (err) => console.error('Approve failed', err)
    });
  }

  openRequestDetails(request: PayerRequest): void {
    this.selectedRequest = request;
  }

  closeRequestDetails(): void {
    this.selectedRequest = null;
  }

  openRejectModal(request: PayerRequest): void {
    this.rejectingRequest = request;
    this.rejectionReason  = '';
    this.showRejectModal  = true;
  }

  confirmReject(): void {
    if (!this.rejectingRequest) return;
    this.payerWorkflowService.reviewRequest(this.rejectingRequest.id, {
      decision: 'REJECTED',
      rejectionReason: this.rejectionReason || 'Rejected by payer'
    }).subscribe({
      next: (updated) => {
        this.rejectingRequest!.status = updated.status;
        if (this.selectedRequest && this.rejectingRequest && this.selectedRequest.id === this.rejectingRequest.id) {
          this.selectedRequest.status = updated.status;
        }
        this.closeRejectModal();
      },
      error: (err) => console.error('Reject failed', err)
    });
  }

  closeRejectModal(): void {
    this.showRejectModal  = false;
    this.rejectingRequest = null;
    this.rejectionReason  = '';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      SUBMITTED:    'bg-yellow-100',
      UNDER_REVIEW: 'bg-blue-100',
      APPROVED:     'bg-green-100',
      REJECTED:     'bg-red-100',
    };
    return map[status] ?? 'bg-gray-100';
  }

  isActionable(status: string): boolean {
    return status === 'SUBMITTED' || status === 'UNDER_REVIEW';
  }

  get approvedToday(): number {
    return this.requests.filter(r => r.status === 'APPROVED').length;
  }

  get rejectedToday(): number {
    return this.requests.filter(r => r.status === 'REJECTED').length;
  }
}
