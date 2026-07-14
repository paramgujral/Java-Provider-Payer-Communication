import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RequestService } from '../../../core/services/request.service';
import { AuthorizationRequest } from '../../../core/models/authorization-request.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './request-details.component.html',
  styleUrls: ['./request-details.component.css']
})
export class RequestDetailsComponent implements OnInit {
  requestId!: number;
  request: AuthorizationRequest | null = null;
  isLoading = true;
  isFhirExpanded = false;

  constructor(
    private route: ActivatedRoute,
    private requestService: RequestService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.requestId = +idParam;
      this.loadDetails();
    }
  }

  loadDetails(): void {
    this.isLoading = true;
    this.requestService.getRequestDetails(this.requestId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.request = res.data;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load request details', err);
      }
    });
  }

  onResubmit(): void {
    // Navigate to create new request but with an edit parameter to pre-populate
    this.router.navigate(['/provider/requests/new'], { queryParams: { edit: this.requestId } });
  }

  downloadDoc(docId: number): void {
    this.http.get(`${environment.apiUrl}/requests/documents/${docId}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document_${docId}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Failed to download document', err)
    });
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getTimelineProgressPercent(status: string | undefined): number {
    if (!status) return 0;
    switch (status) {
      case 'DRAFT': return 0;
      case 'SUBMITTED': return 33;
      case 'UNDER_REVIEW': return 66;
      case 'APPROVED':
      case 'REJECTED':
      case 'INFO_REQUESTED': return 100;
      default: return 0;
    }
  }

  getStepClass(step: string): string {
    if (!this.request || !this.request.status) return '';
    const current = this.request.status;

    if (step === 'DRAFT') {
      return 'completed'; // draft is always completed when we view details
    }

    if (step === 'SUBMITTED') {
      if (current === 'SUBMITTED' || current === 'UNDER_REVIEW' || current === 'APPROVED' || current === 'REJECTED' || current === 'INFO_REQUESTED') {
        return 'completed';
      }
    }

    if (step === 'UNDER_REVIEW') {
      if (current === 'UNDER_REVIEW') return 'active';
      if (current === 'APPROVED' || current === 'REJECTED' || current === 'INFO_REQUESTED') {
        return 'completed';
      }
    }

    return '';
  }

  getFinalStepClass(current: string | undefined): string {
    if (!current) return '';
    if (current === 'APPROVED') return 'completed';
    if (current === 'REJECTED') return 'failed';
    if (current === 'INFO_REQUESTED') return 'active';
    return '';
  }

  getDecisionLabel(current: string | undefined): string {
    if (!current) return 'Decision';
    switch (current) {
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      case 'INFO_REQUESTED': return 'Info Needed';
      default: return 'Decision';
    }
  }

  getDecisionIcon(current: string | undefined): string {
    if (!current) return 'help_outline';
    switch (current) {
      case 'APPROVED': return 'check';
      case 'REJECTED': return 'close';
      case 'INFO_REQUESTED': return 'priority_high';
      default: return 'help_outline';
    }
  }
}
