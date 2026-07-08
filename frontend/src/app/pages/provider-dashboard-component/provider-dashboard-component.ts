import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateRequestModalComponent } from '../../shared/create-request-modal-component/create-request-modal-component';
import { AiReviewModalComponent } from '../../shared/ai-review-modal-component/ai-review-modal-component';
import { AuthorizationRequest } from '../../models/request.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateRequestModalComponent, AiReviewModalComponent],
  templateUrl: './provider-dashboard-component.html'
})
export class ProviderDashboardComponent implements OnInit {
  @ViewChild(CreateRequestModalComponent) createModal!: CreateRequestModalComponent;
  @ViewChild(AiReviewModalComponent) aiModal!: AiReviewModalComponent;

  requests: AuthorizationRequest[] = [];
  loading = false;

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.api.getProviderRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  openCreateModal(): void {
    this.createModal.open();
  }

  submitRequest(id: number): void {
    if (!confirm('Submit this request for AI review?')) return;
    this.api.submitRequest(id).subscribe({
      next: () => {
        alert('Request submitted successfully');
        this.loadRequests();
      },
      error: () => alert('Submission failed')
    });
  }

  viewAiReview(id: number): void {
    this.api.getAiReview(id).subscribe({
      next: (review) => {
        this.aiModal.review = review;
        this.aiModal.open();
      },
      error: () => alert('No AI review found')
    });
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      'PENDING': 'bg-warning text-dark',
      'SUBMITTED': 'bg-primary',
      'APPROVED': 'bg-success',
      'REJECTED': 'bg-danger'
    };
    return map[status] || 'bg-secondary';
  }
}