import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RequestService } from '../../../core/services/request.service';
import { AuthorizationRequest } from '../../../core/models/authorization-request.model';

@Component({
  selector: 'app-payer-queue',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './payer-queue.component.html',
  styleUrls: ['./payer-queue.component.css']
})
export class PayerQueueComponent implements OnInit {
  requests: AuthorizationRequest[] = [];
  filteredRequests: AuthorizationRequest[] = [];
  
  searchTerm = '';
  statusFilter = 'ALL';
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.requestService.getPayerRequests().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.requests = res.data;
          this.applyFilters();
        } else {
          this.errorMessage = res.message || 'Failed to load requests.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'An unexpected error occurred while loading requests.';
        console.error('Failed to load payer requests', err);
      }
    });
  }

  applyFilters(): void {
    this.filteredRequests = this.requests.filter(req => {
      // 1. Search name
      const patientFullName = `${req.patientFirstName} ${req.patientLastName}`.toLowerCase();
      const providerOrgName = req.providerOrganization?.toLowerCase() || '';
      
      const matchSearch = patientFullName.includes(this.searchTerm.toLowerCase()) || 
                          providerOrgName.includes(this.searchTerm.toLowerCase()) ||
                          req.procedureCode.includes(this.searchTerm);

      // 2. Status match
      const matchStatus = this.statusFilter === 'ALL' || req.status === this.statusFilter;

      return matchSearch && matchStatus;
    });
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status.replace(/_/g, ' ');
  }
}
