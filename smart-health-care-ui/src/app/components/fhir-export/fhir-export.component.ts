import { Component } from '@angular/core';
import { ClaimService } from '../../services/claim.service';

@Component({
  selector: 'app-fhir-export',
  templateUrl: './fhir-export.component.html',
  styleUrls: ['./fhir-export.component.css']
})
export class FhirExportComponent {

  claimId!: number;
  fhirData: any;

  constructor(private claimService: ClaimService) { }

  exportFHIR() {

    this.claimService.exportFHIR(this.claimId).subscribe({

      next: (data) => {
        this.fhirData = data;
      },

      error: (err) => {
        console.error(err);
        alert("Unable to export FHIR data.");
      }

    });

  }

}