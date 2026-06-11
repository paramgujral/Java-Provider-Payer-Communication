import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProviderService } from '../../services/provider.service';
import { AuthorizationRequest, AuthorizationStatus } from '../../models';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, TooltipModule, RippleModule, SkeletonModule, HeaderComponent]
})
export class DashboardComponent implements OnInit {
  requests: AuthorizationRequest[] = [];
  isLoading = false;
  selectedRequest: AuthorizationRequest | null = null;
  showDetails = false;

  cols = [
    { field: 'id', header: 'S.No', width: '60px' },
    { field: 'patientName', header: 'Patient Name', width: '150px' },
    { field: 'patientId', header: 'Patient ID', width: '120px' },
    { field: 'insuranceProvider', header: 'Insurance Provider', width: '150px' },
    { field: 'diagnosis', header: 'Diagnosis', width: '130px' },
    { field: 'procedure', header: 'Procedure', width: '150px' },
    { field: 'requestDate', header: 'Request Date', width: '120px' },
    { field: 'status', header: 'Status', width: '140px' },
    { field: 'actions', header: 'Actions', width: '120px' }
  ];

  readonly AuthorizationStatus = AuthorizationStatus;

  constructor(
    private providerService: ProviderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }
createNewRequest(): void {
  this.router.navigate(
    ['/request-new'],
    {
      queryParams: {
        new: true
      }
    }
  );
}

  loadRequests(): void {
    this.isLoading = true;
    this.providerService.getRequests().subscribe(
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

  viewDetails(request: AuthorizationRequest): void {
    this.selectedRequest = request;
    this.router.navigate(['/request-details', request.id]);
  }

  initiateChat(request: AuthorizationRequest): void {
    this.router.navigate(['/chat'], { queryParams: { requestId: request.id } });
  }

  editRequest(request: AuthorizationRequest): void {
    this.router.navigate(['/request-details', request.id], { queryParams: { edit: true } });
  }
}
