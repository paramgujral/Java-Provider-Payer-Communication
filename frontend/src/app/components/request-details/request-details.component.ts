import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProviderService } from '../../services/provider.service';
import { PayerService } from '../../services/payer.service';
import { SharedService } from '../../services/shared.service';
import {
  AuthorizationRequest,
  CopilotRecommendation,
  UserRole,
  AuthorizationStatus
} from '../../models';
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
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TagModule,
    ButtonModule,
    SkeletonModule,
    HeaderComponent
  ]
})
export class RequestDetailsComponent implements OnInit {
  request: AuthorizationRequest | null = null;
  copilotRecommendations: CopilotRecommendation | null = null;
  isLoading = false;
  isEditing = false;
  currentUser: any;
  requestId: any;
  isNewRequest = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private providerService: ProviderService,
    private payerService: PayerService,
    private sharedService: SharedService
  ) { }
  get canEdit(): boolean {
    return this.currentUser?.role === UserRole.PROVIDER;
  }
  initializeNewRequest(): void {

    this.request = {
      id: '',
      patientName: '',
      patientId: '',
      requestId: '',
      insuranceId: '',
      insuranceProvider: '',
      diagnosis: '',
      procedure: '',
      clinicalNotes: '',
      estimatedCost: 0,
      status: AuthorizationStatus.DRAFT,
      requestDate: new Date(),
      lastUpdated: new Date(),
      supportingDocuments: []
    } as AuthorizationRequest;
  }

  ngOnInit(): void {

    this.currentUser = this.sharedService.getCurrentUser();

    this.requestId = this.route.snapshot.paramMap.get('id');

    this.route.queryParams.subscribe((params) => {

      const editRequested = params['edit'] === 'true';
      const newRequested = params['new'] === 'true';

      this.isNewRequest = newRequested;

      this.isEditing =
        (editRequested || newRequested) &&
        this.currentUser?.role === UserRole.PROVIDER;

    });

    if (this.requestId) {

      this.loadRequestDetails(this.requestId);
      this.loadCopilotRecommendations(this.requestId);

    } else if (this.isNewRequest) {

      this.initializeNewRequest();

    }
  }


  loadRequestDetails(requestId: string): void {
    this.isLoading = true;
    (this.currentUser?.role === UserRole.PROVIDER
      ? this.providerService
      : this.payerService
    )
      .getRequestById(requestId)
      .subscribe(
        (data: any) => {
          const res = data
          console.log(data);

          // this.request = data || null;
          this.request = data.length > 0 ? data[0] : null;
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

  if (this.isNewRequest) {

    this.saveDraft();

    return;
  }

  const currentUser = this.sharedService.getCurrentUser();

  if (currentUser?.role === UserRole.PROVIDER) {
    this.router.navigate(['/dashboard']);
  } else {
    this.router.navigate(['/home']);
  }
}
  saveDraft(): void {

  if (!this.request) {
    return;
  }

  const hasData =
    this.request.patientName ||
    this.request.patientId ||
    this.request.insuranceId ||
    this.request.insuranceProvider ||
    this.request.diagnosis ||
    this.request.procedure ||
    this.request.clinicalNotes;

  if (!hasData) {
    this.goBack();
    return;
  }

  const payload = {
    requestId: this.requestId,
    patientName: this.request.patientName,
    patientId: this.request.patientId,
    insuranceId: this.request.insuranceId,
    insuranceProvider: this.request.insuranceProvider,
    diagnosis: this.request.diagnosis,
    procedure: this.request.procedure,
    clinicalNotes: this.request.clinicalNotes,
    estimatedCost: this.request.estimatedCost,

    status: AuthorizationStatus.DRAFT
  };

  this.providerService
    .createRequest(payload as any)
    .subscribe({
      next: () => {
        this.goBack();
      },
      error: (err) => {
        console.error(err);
        this.goBack();
      }
    });
}
  saveRequest(): void {

    if (!this.request) {
      return;
    }

    this.isLoading = true;

const payload = {
  patientName: this.request.patientName,
  patientId: this.request.patientId,
  insuranceId: this.request.insuranceId,
  insuranceProvider: this.request.insuranceProvider,
  diagnosis: this.request.diagnosis,
  procedure: this.request.procedure,
  clinicalNotes: this.request.clinicalNotes,
  estimatedCost: this.request.estimatedCost,

  status: AuthorizationStatus.PENDING_REVIEW
};

    if (this.isNewRequest) {

      this.providerService.createRequest(payload as any)
        .subscribe({

          next: (response) => {

            this.isLoading = false;

            alert('Request created successfully');

            this.router.navigate([
              '/request-details',
              response.id
            ]);
          },

          error: (error) => {
            console.error(error);
            this.isLoading = false;
          }

        });

    } else {

      this.providerService
        .updateRequest(this.requestId, payload)
        .subscribe({

          next: (response) => {

            this.request = response;
            this.isLoading = false;
            this.isEditing = false;

            alert('Request updated successfully');

            this.router.navigate([
              '/request-details',
              response.id
            ]);
          },

          error: (error) => {
            console.error(error);
            this.isLoading = false;
          }

        });

    }
  }
}
