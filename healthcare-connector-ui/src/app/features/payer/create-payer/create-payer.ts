import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PayerService }
from '../../../core/services/payer';

@Component({
  selector: 'app-create-payer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './create-payer.html',
  styleUrl: './create-payer.css'
})
export class CreatePayer {

  payer: any = {

    payerName: '',
    email: '',
    phoneNumber: '',
    address: ''

  };

  constructor(
    private payerService: PayerService,
    private router: Router
  ) {}

  savePayer(): void {

    this.payerService
      .createPayer(this.payer)
      .subscribe({

        next: () => {

          alert(
            'Payer Created Successfully'
          );

          this.router.navigate([
            '/payer-list'
          ]);

        }

      });

  }

}