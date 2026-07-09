import { Component } from '@angular/core';
import { ClaimService } from '../../services/claim.service';

@Component({
  selector: 'app-claim-analysis',
  templateUrl: './claim-analysis.component.html',
  styleUrls: ['./claim-analysis.component.css']
})
export class ClaimAnalysisComponent {

  claimId!: number;
  analysis: any;

  constructor(private claimService: ClaimService) {}

  analyze() {
    this.claimService.analyzeClaim(this.claimId)
      .subscribe({
        next: (data) => {
          this.analysis = data;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

}