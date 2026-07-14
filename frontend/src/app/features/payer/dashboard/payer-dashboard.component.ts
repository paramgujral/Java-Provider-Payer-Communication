import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RequestService } from '../../../core/services/request.service';
import { PayerDashboardStats } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-payer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './payer-dashboard.component.html',
  styleUrls: ['./payer-dashboard.component.css']
})
export class PayerDashboardComponent implements OnInit {
  stats: PayerDashboardStats | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.requestService.getPayerDashboard().subscribe({
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
        console.error('Failed to load payer dashboard stats', err);
      }
    });
  }
}
