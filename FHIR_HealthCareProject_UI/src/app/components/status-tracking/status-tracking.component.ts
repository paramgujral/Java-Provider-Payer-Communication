import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, AuthorizationRequest, Message, StatusHistory } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-status-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './status-tracking.component.html',
  styleUrl: './status-tracking.component.css'
})
export class StatusTrackingComponent implements OnInit {
  requestId = 0;
  request = signal<AuthorizationRequest | null>(null);
  history = signal<StatusHistory[]>([]);
  messages = signal<Message[]>([]);
  showFhir = signal(false);

  newComment = '';
  decisionNote = '';
  processing = signal(false);

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.requestId = +id;
        this.loadDetails();
      }
    });
  }

  loadDetails() {
    this.api.getRequestDetails(this.requestId).subscribe({
      next: (data) => {
        this.request.set(data.request);
        this.history.set(data.history);
        this.messages.set(data.messages);
      },
      error: () => {
        alert('Error loading prior authorization details.');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  toggleFhir() {
    this.showFhir.update(v => !v);
  }

  sendComment() {
    if (!this.newComment.trim()) return;
    const user = this.auth.currentUser();
    if (!user) return;

    this.api.sendMessage(this.requestId, user.id, this.newComment).subscribe({
      next: () => {
        this.newComment = '';
        this.loadMessages();
      }
    });
  }

  loadMessages() {
    this.api.getMessages(this.requestId).subscribe({
      next: (data) => {
        this.messages.set(data);
      }
    });
  }

  isPending(status: string): boolean {
    return ['SUBMITTED', 'UNDER_REVIEW', 'INFO_REQUIRED'].includes(status.toUpperCase());
  }

  decide(decision: 'approve' | 'reject' | 'request-info') {
    const user = this.auth.currentUser();
    if (!user) return;

    this.processing.set(true);
    let note = this.decisionNote.trim();
    if (!note) {
      note = decision === 'approve' ? 'Approved by payer.' : 'Rejected by payer.';
    }

    let action$;
    if (decision === 'approve') {
      action$ = this.api.approveRequest(this.requestId, note, user.id);
    } else if (decision === 'reject') {
      action$ = this.api.rejectRequest(this.requestId, note, user.id);
    } else {
      action$ = this.api.requestMoreInfo(this.requestId, note, user.id);
    }

    action$.subscribe({
      next: () => {
        this.decisionNote = '';
        this.processing.set(false);
        this.loadDetails();
      },
      error: () => {
        this.processing.set(false);
        alert('Failed to complete payer action.');
      }
    });
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'DRAFT': return 'draft';
      case 'SUBMITTED': return 'submitted';
      case 'UNDER_REVIEW': return 'review';
      case 'INFO_REQUIRED': return 'info-req';
      case 'APPROVED': return 'approved';
      case 'REJECTED': return 'rejected';
      default: return 'draft';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'INFO_REQUIRED': return 'Correction Required';
      case 'UNDER_REVIEW': return 'Under Review';
      default: return status;
    }
  }
}
