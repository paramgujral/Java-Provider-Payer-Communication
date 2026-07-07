import { ChangeDetectorRef, Component, inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayerRequest, PayerService } from './payer.service';

@Component({
  selector: 'app-payer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payer.html',
  styleUrl: './payer.css',
  // ← NO changeDetection property at all
})
export class Payer implements OnInit {

  private payerService = inject(PayerService);
  private platformId   = inject(PLATFORM_ID);
   private cdr          = inject(ChangeDetectorRef);
     private zone         = inject(NgZone);

  requests: PayerRequest[] = [];
  loading      = true;   // ← start as true to avoid flicker
  errorMessage = '';

  showRejectModal  = false;
  rejectingRequest: PayerRequest | null = null;
  rejectionReason  = '';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadRequests();
    }
  }

  loadRequests(): void {
  this.loading = true;
  this.errorMessage = '';

  this.payerService.getPendingRequests().subscribe({
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
  approve(request: PayerRequest): void {
    this.payerService.reviewRequest(request.id, {
      decision: 'APPROVED',
      reviewNotes: 'Approved by payer'
    }).subscribe({
      next: (updated) => {
        request.status = updated.status;
      },
      error: (err) => console.error('Approve failed', err)
    });
  }

  openRejectModal(request: PayerRequest): void {
    this.rejectingRequest = request;
    this.rejectionReason  = '';
    this.showRejectModal  = true;
  }

  confirmReject(): void {
    if (!this.rejectingRequest) return;
    this.payerService.reviewRequest(this.rejectingRequest.id, {
      decision: 'REJECTED',
      rejectionReason: this.rejectionReason || 'Rejected by payer'
    }).subscribe({
      next: (updated) => {
        this.rejectingRequest!.status = updated.status;
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
      SUBMITTED:    'bg-yellow-100 text-yellow-800',
      UNDER_REVIEW: 'bg-blue-100 text-blue-800',
      APPROVED:     'bg-green-100 text-green-800',
      REJECTED:     'bg-red-100 text-red-800',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
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
