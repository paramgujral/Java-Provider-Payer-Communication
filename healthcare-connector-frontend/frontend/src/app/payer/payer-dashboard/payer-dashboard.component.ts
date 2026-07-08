import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AppNotification, AuthorizationRequest } from '../../core/models/authorization-request.model';

@Component({
  selector: 'app-payer-dashboard',
  templateUrl: './payer-dashboard.component.html'
})
export class PayerDashboardComponent implements OnInit {
  requests: AuthorizationRequest[] = [];
  notifications: AppNotification[] = [];
  loading = true;
  notesDraft: { [id: number]: string } = {};

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadRequests();
    this.loadNotifications();
  }

  loadRequests(): void {
    this.loading = true;
    this.api.getIncomingRequests().subscribe({
      next: data => {
        this.requests = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadNotifications(): void {
    this.api.getNotifications().subscribe({
      next: data => (this.notifications = data),
      error: () => {}
    });
  }

  decide(request: AuthorizationRequest, decision: 'APPROVED' | 'REJECTED'): void {
    const notes = this.notesDraft[request.id!] ?? '';
    this.api.decideRequest(request.id!, decision, notes).subscribe({
      next: updated => {
        const idx = this.requests.findIndex(r => r.id === updated.id);
        if (idx >= 0) {
          this.requests[idx] = updated;
        }
        this.loadNotifications();
      }
    });
  }

  statusClass(status?: string): string {
    switch (status) {
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
