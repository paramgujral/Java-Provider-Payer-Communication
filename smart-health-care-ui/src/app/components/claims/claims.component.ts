import { Component, OnInit } from '@angular/core';
import { Claim } from '../../models/claimmodel';
import { ClaimService } from '../../services/claim.service';

@Component({
  selector: 'app-claims',
  templateUrl: './claims.component.html',
  styleUrls: ['./claims.component.css']
})
export class ClaimsComponent implements OnInit {

  claims: Claim[] = [];

  constructor(private claimService: ClaimService) {}

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.claimService.getAllClaims().subscribe({
      next: (data) => {
        this.claims = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  approveClaim(id: number | undefined) {

  if (!id) return;

  this.claimService.approveClaim(id).subscribe(() => {
    this.loadClaims();
  });

}

rejectClaim(id: number | undefined) {

  if (!id) return;

  const reason = prompt("Enter rejection reason");

  if (reason) {

    this.claimService.rejectClaim(id, reason).subscribe(() => {
      this.loadClaims();
    });

  }

}
}