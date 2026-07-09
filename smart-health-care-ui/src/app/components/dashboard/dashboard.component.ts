import { Component, OnInit } from '@angular/core';
import { Claim } from '../../models/claimmodel';
import { ClaimService } from '../../services/claim.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  totalClaims = 0;
  approvedClaims = 0;
  rejectedClaims = 0;
  pendingClaims = 0;

  constructor(private claimService: ClaimService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.claimService.getAllClaims().subscribe(data => {

      this.totalClaims = data.length;

      this.approvedClaims = data.filter(
        c => c.status?.toUpperCase() === 'APPROVED'
      ).length;

      this.rejectedClaims = data.filter(
        c => c.status?.toUpperCase() === 'REJECTED'
      ).length;

      this.pendingClaims = data.filter(
        c => c.status?.toUpperCase() === 'PENDING'
      ).length;

    });
  }

}