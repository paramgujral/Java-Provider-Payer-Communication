import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthorizationService, AuthorizationRequest, Page } from '../../../services/authorization.service';

@Component({
  selector: 'app-provider-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './provider-requests.component.html',
  styleUrl: './provider-requests.component.css'
})
export class ProviderRequestsComponent implements OnInit {
  requests: AuthorizationRequest[] = [];
  filteredRequests: AuthorizationRequest[] = [];
  loading = true;
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;
  currentFilter = 'All';
  providerId = localStorage.getItem('userId') || 'PROV-101';
  Math = Math;

  constructor(private authService: AuthorizationService) { }

  ngOnInit() {
    this.loadRequests(0);
  }

  loadRequests(page: number) {
    this.loading = true;
    this.authService.getRequestsByProvider(this.providerId, page, this.pageSize).subscribe({
      next: (response: Page<AuthorizationRequest>) => {
        this.requests = response.content;
        this.currentPage = response.number;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.pageSize = response.size;
        this.applyFilter();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading requests', err);
        this.loading = false;
      }
    });
  }

  setFilter(filter: string) {
    this.currentFilter = filter;
    this.applyFilter();
  }

  searchQuery = '';

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
      case 'Pending':
        this.filteredRequests = filtered.filter(r => r.status === 'PENDING');
        break;
      case 'Approved':
        this.filteredRequests = filtered.filter(r => r.status === 'APPROVED');
        break;
      case 'Rejected':
        this.filteredRequests = filtered.filter(r => r.status === 'REJECTED');
        break;
      default:
        this.filteredRequests = [...filtered];
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 3;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);
    start = Math.max(0, end - maxVisible);
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  formatStatus(status: string | undefined): string {
    if (!status) return 'Draft';
    switch (status) {
      case 'INFO_REQUESTED': return 'Info Requested';
      case 'PENDING': return 'Pending';
      case 'APPROVED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      default: return status.charAt(0) + status.slice(1).toLowerCase();
    }
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
}
