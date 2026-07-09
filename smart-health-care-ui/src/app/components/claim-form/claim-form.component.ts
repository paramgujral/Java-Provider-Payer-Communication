import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClaimService } from '../../services/claim.service';

@Component({
  selector: 'app-claim-form',
  templateUrl: './claim-form.component.html',
  styleUrls: ['./claim-form.component.css']
})
export class ClaimFormComponent {

  claimForm: FormGroup;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private claimService: ClaimService
  ) {

    this.claimForm = this.fb.group({

      patientId: ['', Validators.required],
      providerId: ['', Validators.required],
      payerId: ['', Validators.required],
      amount: ['', Validators.required],
      diagnosis: ['', Validators.required],
      treatment: ['', Validators.required]

    });

  }

  onSubmit() {

    if (this.claimForm.invalid) {
      return;
    }

    this.claimService.submitClaim(this.claimForm.value)
      .subscribe({

        next: () => {

          this.successMessage = 'Claim submitted successfully.';

          this.claimForm.reset();

        },

        error: (err) => {

          console.log(err);

        }

      });

  }
 
  

}