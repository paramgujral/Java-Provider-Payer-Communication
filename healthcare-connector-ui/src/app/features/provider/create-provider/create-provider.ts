import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProviderService }
from '../../../core/services/provider';

@Component({
  selector: 'app-create-provider',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-provider.html',
  styleUrl: './create-provider.css'
})
export class CreateProvider {

  providerName = '';
  email = '';
  phoneNumber = '';
  address = '';

  constructor(
    private providerService: ProviderService,
    private router: Router
  ) {}

  saveProvider() {

    const payload = {

      providerName: this.providerName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      address: this.address

    };

    this.providerService
      .createProvider(payload)
      .subscribe({

        next: () => {

          alert(
            'Provider Created Successfully'
          );

          this.router.navigate([
            '/provider-list'
          ]);
        },

        error: (error) => {

          console.error(error);

        }
      });
  }
}