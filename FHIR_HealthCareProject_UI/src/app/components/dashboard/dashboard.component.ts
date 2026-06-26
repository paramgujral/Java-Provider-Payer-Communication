import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService, AuthorizationRequest } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  requests = signal<AuthorizationRequest[]>([]);
  loading = signal(false);
  avgConfidence = signal<number>(0);

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadRequests();
  }

  loadRequests() {
    this.loading.set(true);
    const user = this.auth.currentUser();
    if (!user) return;

    const request$ = user.role === 'ROLE_PROVIDER' 
      ? this.api.getRequestsForProvider(user.id)
      : this.api.getRequestsForPayer();

    request$.subscribe({
      next: (data) => {
        this.requests.set(data);
        this.calculateMetrics(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  calculateMetrics(data: AuthorizationRequest[]) {
    if (data.length === 0) {
      this.avgConfidence.set(0);
      return;
    }
    const scoreSum = data.reduce((sum, item) => sum + (item.confidenceScore || 0), 0);
    this.avgConfidence.set(Math.round(scoreSum / data.length));
  }

  getCount(status: string): number {
    return this.requests().filter(r => r.status === status).length;
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

  getScoreClass(score: number): string {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-danger';
  }

  viewDetails(id: number) {
    this.router.navigate([`/request/track/${id}`]);
  }

  editRequest(id: number) {
    this.router.navigate([`/request/edit/${id}`]);
  }
}
