import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthorizationService } from '../services/authorization.service';
import { AuthorizationRequest } from '../models/authorization-request';

@Component({
  selector: 'app-payer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payer.component.html',
  styleUrls: ['./payer.component.css']
})
export class PayerComponent implements OnInit {

  requests: AuthorizationRequest[] = [];

  selectedFHIR = '';

  selectedReview = '';

  constructor(private service: AuthorizationService) { }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {

    this.service.getAllRequests().subscribe(data => {

      this.requests = data;

    });

  }

  approve(id?: number) {

    if (!id) return;

    this.service.approve(id).subscribe(() => {

      this.loadRequests();

    });

  }

  reject(id?: number) {

    if (!id) return;

    this.service.reject(id).subscribe(() => {

      this.loadRequests();

    });

  }

  showFHIR(id?: number) {

    if (!id) return;

    this.service.getFHIR(id).subscribe(data => {

      this.selectedFHIR = data;

    });

  }

  showAIReview(id?: number) {

    if (!id) return;

    this.service.getReview(id).subscribe(data => {

      this.selectedReview = data;

    });

  }

  get pending() {

    return this.requests.filter(r => r.status === 'Pending').length;

  }

  get approved() {

    return this.requests.filter(r => r.status === 'Approved').length;

  }

  get rejected() {

    return this.requests.filter(r => r.status === 'Rejected').length;

  }

}