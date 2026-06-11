import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PayerService } from '../../services/payer.service';
import { AuthorizationRequest, AuthorizationStatus } from '../../models';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, TooltipModule, RippleModule, SkeletonModule, HeaderComponent]
})
export class HomeComponent implements OnInit {
  requests: AuthorizationRequest[] = [];
  isLoading = false;
  selectedRequest: AuthorizationRequest | null = null;

  cols = [
    { field: 'id', header: 'S.No' },
    { field: 'patientName', header: 'Patient Name' },
    { field: 'status', header: 'Status' },
    { field: 'lastUpdated', header: 'Last Updated' },
    { field: 'actions', header: 'Actions' }
  ];

  readonly AuthorizationStatus = AuthorizationStatus;

  constructor(
    private payerService: PayerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    const payerId = 6; // temporary
    this.isLoading = true;
    this.payerService.getRequests().subscribe(
      (data) => {
        this.requests = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading requests:', error);
        this.isLoading = false;
      }
    );
  }

  getStatusSeverity(status: AuthorizationStatus): 'info' | 'success' | 'warn' | 'danger' {
    switch (status) {
      case AuthorizationStatus.DRAFT:
        return 'warn';
      case AuthorizationStatus.SUBMITTED:
        return 'info';
      case AuthorizationStatus.PENDING_REVIEW:
        return 'info';
      case AuthorizationStatus.APPROVED:
        return 'success';
      case AuthorizationStatus.REJECTED:
        return 'danger';
      case AuthorizationStatus.ADDITIONAL_INFO_REQUIRED:
        return 'warn';
      default:
        return 'info';
    }
  }

  preview(request: AuthorizationRequest): void {
    this.router.navigate(['/request-details', request.id]);
  }

  initiateChat(request: AuthorizationRequest): void {
    this.router.navigate(['/chat'], { queryParams: { requestId: request.id } });
  }
}
