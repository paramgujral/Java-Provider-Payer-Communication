import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthorizationService, AuthorizationRequest, Page } from '../../../services/authorization.service';

@Component({
  selector: 'app-payer-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './payer-requests.component.html',
  styleUrl: './payer-requests.component.css'
})
export class PayerRequestsComponent implements OnInit {
  requests: AuthorizationRequest[] = [];
  filteredRequests: AuthorizationRequest[] = [];
  loading = true;
  currentPage = 0;
  totalPages = 0;
  payerId = localStorage.getItem('userId') || 'PAY-202';
  searchQuery = '';
  currentFilter = 'All';

  constructor(private authService: AuthorizationService) { }

  ngOnInit() {
    this.loadRequests(0);
  }

  getInitials(providerId: string): string {
    if (!providerId) return 'PR';
    if (providerId === 'PROV-101') return 'GH'; // Mock Dr. Gregory House
    if (providerId.startsWith('PROV')) return providerId.substring(providerId.length - 2);
    return providerId.substring(0, 2).toUpperCase();
  }

  getAiScoreClass(score: number): string {
    if (score >= 0.8) return 'bg-green';
    return 'bg-orange';
  }

  loadRequests(page: number) {
    this.loading = true;
    this.authService.getRequestsByPayer(this.payerId, page, 10).subscribe({
      next: (response: Page<AuthorizationRequest>) => {
        this.requests = response.content;
        this.currentPage = response.number;
        this.totalPages = response.totalPages;
        this.applyFilter();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading requests', err);
        this.loading = false;
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

  setFilter(filter: string) {
    this.currentFilter = filter;
    this.applyFilter();
  }

  applyFilter() {
    let filtered = this.requests;
    
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(r => {
        const patientName = `${r.patientInfo.firstName} ${r.patientInfo.lastName}`.toLowerCase();
        const memberId = (r.patientInfo.memberId || '').toLowerCase();
        const serviceType = (r.serviceType || '').toLowerCase();
        return (r.id && r.id.toLowerCase().includes(q)) || 
               patientName.includes(q) ||
               memberId.includes(q) ||
               serviceType.includes(q);
      });
    }

    switch (this.currentFilter) {
      case 'High Priority':
        this.filteredRequests = filtered.filter(r => r.urgency === 'URGENT' || r.urgency === 'EMERGENCY');
        break;
      case 'Requires Info':
        this.filteredRequests = filtered.filter(r => r.status === 'INFO_REQUESTED');
        break;
      case 'AI Recommended':
        this.filteredRequests = filtered.filter(r => (r.aiConfidenceScore || 0) >= 0.8 && r.status === 'PENDING');
        break;
      default:
        this.filteredRequests = [...filtered];
    }
  }
}
