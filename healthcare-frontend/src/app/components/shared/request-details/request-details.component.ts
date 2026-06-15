import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthorizationService, AuthorizationRequest, AiReviewResponse } from '../../../services/authorization.service';

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './request-details.component.html',
  styleUrls: ['./request-details.component.css']
})
export class RequestDetailsComponent implements OnInit {
  request: AuthorizationRequest | null = null;
  loading = true;
  role = localStorage.getItem('role') || 'provider';
  userId = localStorage.getItem('userId') || 'PROV-101';

  newNoteContent = '';
  updatingStatus = false;

  // AI Adjudication State
  runningAdjudication = false;
  aiAdjudication: AiReviewResponse | null = null;
  showAiModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthorizationService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadRequest(id);
      }
    });
  }

  loadRequest(id: string) {
    this.loading = true;
    this.authService.getRequestById(id).subscribe({
      next: (req) => {
        this.request = req;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load request', err);
        this.loading = false;
        alert('Could not load the request details.');
      }
    });
  }

  updateStatus(status: string) {
    if (!this.request?.id) return;

    this.updatingStatus = true;
    this.authService.updateStatus(this.request.id, status).subscribe({
      next: (updatedReq) => {
        this.request = updatedReq;
        this.updatingStatus = false;
      },
      error: (err) => {
        console.error('Failed to update status', err);
        this.updatingStatus = false;
        alert('Failed to update status.');
      }
    });
  }

  addNote() {
    if (!this.newNoteContent.trim() || !this.request?.id) return;

    this.authService.addNote(this.request.id, this.userId, this.role.toUpperCase(), this.newNoteContent).subscribe({
      next: (updatedReq) => {
        this.request = updatedReq;
        this.newNoteContent = ''; // clear input
      },
      error: (err) => {
        console.error('Failed to add note', err);
        alert('Failed to add communication note.');
      }
    });
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'badge-pending';
      case 'APPROVED': return 'badge-approved';
      case 'REJECTED': return 'badge-rejected';
      case 'INFO_REQUESTED': return 'badge-info-requested';
      default: return 'badge-draft';
    }
  }

  runAdjudication() {
    if (!this.request?.id) return;
    this.runningAdjudication = true;
    this.authService.adjudicateRequest(this.request.id).subscribe({
      next: (res) => {
        this.aiAdjudication = res;
        this.showAiModal = true;
        this.runningAdjudication = false;
      },
      error: (err) => {
        console.error('Failed to run AI Adjudication', err);
        // Show the modal with a fallback error response instead of a raw alert
        this.aiAdjudication = {
          confidenceScore: 0,
          requiresCorrection: true,
          suggestions: ['AI Adjudication service is currently unavailable. Please review the request manually and try again later.']
        };
        this.showAiModal = true;
        this.runningAdjudication = false;
      }
    });
  }
}
