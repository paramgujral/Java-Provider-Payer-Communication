import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../../environments/environment';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RequestService } from '../../../core/services/request.service';
import { AuthorizationRequest } from '../../../core/models/authorization-request.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-payer-review',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './payer-review.component.html',
  styleUrls: ['./payer-review.component.css']
})
export class PayerReviewComponent implements OnInit {
  requestId!: number;
  request: AuthorizationRequest | null = null;
  payerRemarks = '';
  
  isLoading = true;
  isSubmitting = false;
  isFhirExpanded = false;

  constructor(
    private route: ActivatedRoute,
    private requestService: RequestService,
    private snackBar: MatSnackBar,
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
          // Set request to Under Review if it is currently in SUBMITTED status
          if (this.request.status === 'SUBMITTED') {
            this.updateStatusToUnderReview();
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load request details', err);
      }
    });
  }

  private updateStatusToUnderReview(): void {
    this.requestService.updateRequestStatus(this.requestId, 'UNDER_REVIEW').subscribe({
      next: (res) => {
        if (res.success && this.request) {
          this.request.status = 'UNDER_REVIEW';
        }
      }
    });
  }

  onUpdateStatus(status: 'APPROVED' | 'REJECTED' | 'INFO_REQUESTED'): void {
    if ((status === 'REJECTED' || status === 'INFO_REQUESTED') && !this.payerRemarks.trim()) {
      this.snackBar.open('Remarks are mandatory for rejections and info requests.', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    this.requestService.updateRequestStatus(this.requestId, status, this.payerRemarks).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.snackBar.open(`Request status updated to ${status} successfully.`, 'Close', { duration: 3000 });
          this.router.navigate(['/payer/dashboard']);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.snackBar.open('Failed to update request status.', 'Close', { duration: 4000 });
      }
    });
  }

  viewDoc(doc: any): void {
    this.http.get(`${environment.apiUrl}/requests/documents/${doc.id}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        // Create a new blob using the exact fileType to force the browser to render it natively
        const fileBlob = new Blob([blob], { type: doc.fileType });
        const url = window.URL.createObjectURL(fileBlob);
        
        // Open in a new tab
        window.open(url, '_blank');
        
        // Clean up the URL after a short delay so the new tab has time to load it
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      },
      error: (err) => console.error('Failed to view document', err)
    });
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getScoreColorClass(score: number): string {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status.replace(/_/g, ' ');
  }
}
