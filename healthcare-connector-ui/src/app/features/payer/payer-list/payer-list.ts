import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PayerService }
from '../../../core/services/payer';

@Component({
  selector: 'app-payer-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './payer-list.html',
  styleUrl: './payer-list.css'
})
export class PayerList
implements OnInit {

  payers: any[] = [];

  constructor(
    private payerService: PayerService
  ) {}

  ngOnInit(): void {

    this.loadPayers();

  }

  loadPayers(): void {

    this.payerService
      .getAllPayers()
      .subscribe({

        next: (response: any) => {

          this.payers =
            response.data || [];

        }

      });

  }

}