import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthorizationService } from '../services/authorization.service';
import { AuthorizationRequest } from '../models/authorization-request';

@Component({
  selector: 'app-provider',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './provider.component.html',
  styleUrls: ['./provider.component.css']
})
export class ProviderComponent implements OnInit {

  request: AuthorizationRequest = {

    patientFirstName: '',
    patientLastName: '',
    dateOfBirth: '',
    gender: '',
    mobileNumber: '',
    email: '',

    insuranceId: '',
    insuranceCompany: '',
    memberId: '',
    policyNumber: '',
    groupNumber: '',

    providerName: '',
    providerNpi: '',
    providerAddress: '',

    diagnosis: '',
    diagnosisCode: '',
    procedureName: '',
    procedureCode: '',
    priority: '',

    requestedDate: '',
    expectedServiceDate: '',
    clinicalNotes: '',

    status: '',
    aiReview: '',
    fhirJson: ''

  };

  requests: AuthorizationRequest[] = [];

  validationPassed = false;

  aiErrors: any[] = [];

  fhirJson = '';

  notification = '';
  loading = false;

  constructor(private authorizationService: AuthorizationService) { }

  ngOnInit(): void {
    this.loadRequests();
  }

  submitRequest(form?: any) {

    this.authorizationService
      .createRequest(this.request)
      .subscribe(() => {

        this.loadRequests();

        this.resetForm(form);

      });

  }

  reviewWithAI() {

    this.loading = true;

    this.authorizationService.reviewRequest(this.request)
      .subscribe({

        next: (response: any) => {

          console.log(response);

          this.validationPassed = response.valid;
          this.aiErrors = response.errors ?? [];

          this.loading = false;

        },

        error: (err) => {

          console.error(err);

          this.loading = false;

        }

      });

  }
  loadRequests() {

    this.authorizationService
      .getAllRequests()
      .subscribe(data => {

        this.requests = data;

        if (this.requests.length > 0) {

          const latest = this.requests[this.requests.length - 1];

          this.notification =
            `Latest Request Status : ${latest.status}`;

        }

      });

  }

  deleteRequest(id?: number) {

    if (!id) {
      return;
    }

    if (confirm('Delete this request?')) {

      this.authorizationService
        .deleteRequest(id)
        .subscribe(() => {

          this.loadRequests();

        });

    }

  }

  viewFHIR(id?: number) {

    if (!id) return;

    this.authorizationService
      .getFHIR(id)
      .subscribe(data => {

        this.fhirJson = data;

      });

  }

  private resetForm(form?: any) {

    this.request = {

      patientFirstName: '',
      patientLastName: '',
      dateOfBirth: '',
      gender: '',
      mobileNumber: '',
      email: '',

      insuranceId: '',
      insuranceCompany: '',
      memberId: '',
      policyNumber: '',
      groupNumber: '',

      providerName: '',
      providerNpi: '',
      providerAddress: '',

      diagnosis: '',
      diagnosisCode: '',
      procedureName: '',
      procedureCode: '',
      priority: '',

      requestedDate: '',
      expectedServiceDate: '',
      clinicalNotes: '',

      status: '',
      aiReview: '',
      fhirJson: ''

    };

    if (form) {
      form.resetForm(this.request);
    }

  }

}