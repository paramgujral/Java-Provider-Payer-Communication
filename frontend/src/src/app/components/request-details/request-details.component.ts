import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProviderService } from '../../services/provider.service';
import { PayerService } from '../../services/payer.service';
import { SharedService } from '../../services/shared.service';
import { AuthorizationRequest, CopilotRecommendation, UserRole, AuthorizationStatus } from '../../models';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-request-details',
  templateUrl: './request-details.component.html',
  styleUrls: ['./request-details.component.scss'],
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, ButtonModule, SkeletonModule, HeaderComponent]
})
export class RequestDetailsComponent implements OnInit {
  request: AuthorizationRequest | null = null;
  copilotRecommendations: CopilotRecommendation | null = null;
  isLoading = false;
  isEditing = false;
  currentUser: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private providerService: ProviderService,
    private payerService: PayerService,
    private sharedService: SharedService
  ) {
    this.currentUser = this.sharedService.getCurrentUser();
  }

  ngOnInit(): void {
    const requestId = this.route.snapshot.paramMap.get('id');
    if (requestId) {
      this.loadRequestDetails(requestId);
      this.loadCopilotRecommendations(requestId);
    }

    this.route.queryParams.subscribe((params) => {
      this.isEditing = params['edit'] === 'true';
    });
  }

  loadRequestDetails(requestId: string): void {
    this.isLoading = true;
    (this.currentUser?.role === UserRole.PROVIDER
      ? this.providerService
      : this.payerService
    )
      .getRequestById(requestId)
      .subscribe(
        (data) => {
          this.request = data || null;
          this.isLoading = false;
        },
        (error) => {
          console.error('Error loading request details:', error);
          this.isLoading = false;
        }
      );
  }

  loadCopilotRecommendations(requestId: string): void {
    this.providerService.getCopilotRecommendations(requestId).subscribe(
      (data) => {
        this.copilotRecommendations = data;
      },
      (error) => {
        console.error('Error loading copilot recommendations:', error);
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

  approveRequest(): void {
    if (this.request && this.currentUser?.role === UserRole.PAYER) {
      this.isLoading = true;
      this.payerService.approveRequest(this.request.id).subscribe(
        (data) => {
          this.request = data;
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        (error) => {
          console.error('Error approving request:', error);
          this.isLoading = false;
        }
      );
    }
  }

  rejectRequest(): void {
    if (this.request && this.currentUser?.role === UserRole.PAYER) {
      const reason = prompt('Please provide a reason for rejection:');
      if (reason) {
        this.isLoading = true;
        this.payerService.rejectRequest(this.request.id, reason).subscribe(
          (data) => {
            this.request = data;
            this.isLoading = false;
            this.router.navigate(['/home']);
          },
          (error) => {
            console.error('Error rejecting request:', error);
            this.isLoading = false;
          }
        );
      }
    }
  }

  goBack(): void {
    const currentUser = this.sharedService.getCurrentUser();
    if (currentUser?.role === UserRole.PROVIDER) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
