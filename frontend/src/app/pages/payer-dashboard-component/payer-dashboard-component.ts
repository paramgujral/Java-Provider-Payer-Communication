import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { AuthorizationRequest, ResponseStatus } from '../../models/request.model';

@Component({
  selector: 'app-payer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payer-dashboard-component.html'
})
export class PayerDashboardComponent implements OnInit {
  requests: AuthorizationRequest[] = [];
  loading = false;
  ResponseStatus = ResponseStatus;

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.loading = true;
    this.api.getPayerRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  respond(id: number, status: ResponseStatus): void {
    if (!confirm(`${status} this request?`)) return;
    const notes = status === ResponseStatus.APPROVED ? 'Approved by adjuster' : 'Rejected by adjuster';
    this.api.respondToRequest(id, { status, notes }).subscribe({
      next: () => {
        alert(`Request ${status.toLowerCase()} successfully`);
        this.loadPending();
      },
      error: () => alert('Action failed')
    });
  }
}