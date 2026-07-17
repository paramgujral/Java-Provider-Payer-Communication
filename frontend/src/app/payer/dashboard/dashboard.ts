import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthorizationDecisionPayload, AuthorizationResponse, AuthorizationService } from '../../core/services/authorization.service';
import { PayerPayload, PayerResponse, PayerService } from '../../core/services/payer.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  payers: PayerResponse[] = [];
  requests: AuthorizationResponse[] = [];
  selectedRequest: AuthorizationResponse | null = null;
  form: PayerPayload = {
    payerCode: '',
    companyName: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
    status: 'ACTIVE'
  };
  decision: AuthorizationDecisionPayload = {
    status: 'APPROVED',
    reason: ''
  };
  message = '';
  summary: any = null;
  decidingRequestId: number | null = null;

  constructor(
    private payerService: PayerService,
    private authorizationService: AuthorizationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadPayers();
    this.loadSummary();
    this.loadRequests();
  }

  loadPayers(): void {
    this.payerService.getPayers().subscribe({
      next: (response) => {
        this.payers = response.data ?? [];
      },
      error: () => {
        this.message = 'Unable to load payers.';
      }
    });
  }

  loadSummary(): void {
    this.http.get<any>(environment.apiUrl + '/payer/dashboard').subscribe({
      next: (response) => {
        this.summary = response.data;
      }
    });
  }

  loadRequests(): void {
    this.authorizationService.listPayerQueue().subscribe({
      next: (response) => {
        const queue = this.toPayerVisibleRequests(response.data ?? []);
        if (queue.length > 0) {
          this.requests = queue;
          if (this.selectedRequest) {
            this.selectedRequest = this.requests.find((item) => item.id === this.selectedRequest?.id) ?? null;
          }
          return;
        }

        // Fallback for older backend builds that do not yet expose payer queue rows correctly.
        this.loadRequestsFromAuthorizationList();
      },
      error: () => {
        this.loadRequestsFromAuthorizationList();
      }
    });
  }

  private loadRequestsFromAuthorizationList(): void {
    this.authorizationService.list().subscribe({
      next: (response) => {
        this.requests = this.toPayerVisibleRequests(response.data ?? []);
        if (this.selectedRequest) {
          this.selectedRequest = this.requests.find((item) => item.id === this.selectedRequest?.id) ?? null;
        }
      },
      error: () => {
        this.message = 'Unable to load authorization requests.';
      }
    });
  }

  private toPayerVisibleRequests(requests: AuthorizationResponse[]): AuthorizationResponse[] {
    const visibleStatuses = new Set([
      'SUBMITTED',
      'SUBMITED',
      'PENDING',
      'INVALID',
      'NEED_MORE_INFO'
    ]);

    return requests.filter((item) => {
      const normalizedStatus = (item.status || '').trim().toUpperCase();
      return visibleStatuses.has(normalizedStatus) || normalizedStatus.startsWith('SUBMIT');
    });
  }

  selectRequest(request: AuthorizationResponse): void {
    this.selectedRequest = request;
    this.decision = {
      status: request.status === 'REJECTED' ? 'REJECTED' : request.status === 'NEED_MORE_INFO' ? 'NEED_MORE_INFO' : 'APPROVED',
      reason: request.decisionReason || ''
    };
  }

  applyDecision(status: 'APPROVED' | 'REJECTED' | 'NEED_MORE_INFO'): void {
    if (!this.selectedRequest) {
      this.message = 'Select a request to review first.';
      return;
    }

    this.decidingRequestId = this.selectedRequest.id;
    const payload: AuthorizationDecisionPayload = {
      status,
      reason: this.decision.reason || ''
    };

    this.authorizationService.decide(this.selectedRequest.id, payload)
      .pipe(finalize(() => {
        this.decidingRequestId = null;
      }))
      .subscribe({
        next: (response) => {
          this.selectedRequest = response.data;
          this.message = `Request ${status.toLowerCase()} successfully.`;
          this.loadRequests();
        },
        error: (error) => {
          this.message = error?.error?.message || 'Unable to apply payer decision.';
        }
      });
  }

  submit(): void {
    this.payerService.createPayer(this.form).subscribe({
      next: () => {
        this.message = 'Payer created successfully.';
        this.form = {
          payerCode: '',
          companyName: '',
          website: '',
          phone: '',
          email: '',
          address: '',
          city: '',
          state: '',
          country: '',
          status: 'ACTIVE'
        };
        this.loadPayers();
        this.loadSummary();
      },
      error: () => {
        this.message = 'Unable to create payer.';
      }
    });
  }
}
