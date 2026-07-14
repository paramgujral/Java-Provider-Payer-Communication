import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RequestService } from '../../../core/services/request.service';
import { ProviderDashboardStats } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './provider-dashboard.component.html',
  styleUrls: ['./provider-dashboard.component.css']
})
export class ProviderDashboardComponent implements OnInit {
  stats: ProviderDashboardStats | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.requestService.getProviderDashboard().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.stats = res.data;
        } else {
          this.errorMessage = res.message || 'Failed to load dashboard data';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'An unexpected error occurred while loading dashboard.';
        console.error('Failed to load dashboard statistics', err);
      }
    });
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status.replace(/_/g, ' ');
  }
}
