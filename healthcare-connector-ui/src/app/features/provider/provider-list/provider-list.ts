import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ProviderService } from '../../../core/services/provider';

@Component({
  selector: 'app-provider-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './provider-list.html',
  styleUrl: './provider-list.css'
})
export class ProviderList implements OnInit {

  providers: any[] = [];

  constructor(
    private providerService: ProviderService
  ) {}

  ngOnInit(): void {

  console.log('Provider List Loaded');

  this.loadProviders();
}

 loadProviders(): void {

  this.providerService.getAllProviders()
    .subscribe({

      next: (response: any) => {

        console.log('Response:', response);

        this.providers = response.data;

        console.log('Providers:', this.providers);
        console.log('Length:', this.providers.length);
      },

      error: (error) => {
        console.error(error);
      }

    });


  }
}