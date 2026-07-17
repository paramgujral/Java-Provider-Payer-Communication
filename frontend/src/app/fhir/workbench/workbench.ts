import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FhirOutboundResponse, FhirResourceType, FhirService, FhirValidationResponse, FhirValidationStatus } from '../../core/services/fhir.service';

type FhirActionState = 'idle' | 'loading' | 'done' | 'error';

@Component({
  selector: 'app-fhir-workbench',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workbench.html',
  styleUrl: './workbench.css'
})
export class FhirWorkbenchComponent implements OnInit {
  resourceType: FhirResourceType = 'Patient';
  validateBeforeCreate = true;
  resourceId = '';
  payerUrl = 'http://localhost:8080/api/payer';
  resourceJson = this.samplePayload('Patient');

  status: FhirValidationStatus | null = null;
  validationResult: FhirValidationResponse | null = null;
  createResult: any = null;
  fetchResult = '';
  outboundResult: FhirOutboundResponse | null = null;
  message = '';

  validationState: FhirActionState = 'idle';
  createState: FhirActionState = 'idle';
  fetchState: FhirActionState = 'idle';
  outboundState: FhirActionState = 'idle';

  constructor(private fhirService: FhirService) {}

  ngOnInit(): void {
    this.loadStatus();
  }

  selectResourceType(resourceType: FhirResourceType): void {
    this.resourceType = resourceType;
    this.resourceJson = this.samplePayload(resourceType);
    this.validationResult = null;
    this.createResult = null;
    this.fetchResult = '';
    this.outboundResult = null;
    this.message = '';
  }

  loadStatus(): void {
    this.fhirService.getValidationStatus().subscribe({
      next: (response) => {
        this.status = response;
      },
      error: () => {
        this.message = 'Unable to load FHIR validation status.';
      }
    });
  }

  validateResource(): void {
    this.validationState = 'loading';
    this.message = 'Validating FHIR resource...';
    this.fhirService.validate(this.resourceType, this.resourceJson).subscribe({
      next: (response) => {
        this.validationResult = response;
        this.validationState = 'done';
        this.message = response.valid ? 'FHIR validation passed.' : 'FHIR validation found issues.';
      },
      error: () => {
        this.validationState = 'error';
        this.message = 'Unable to validate FHIR resource.';
      }
    });
  }

  createResource(): void {
    this.createState = 'loading';
    this.message = 'Saving FHIR resource...';
    this.fhirService.create(this.resourceType, this.resourceJson, this.validateBeforeCreate).subscribe({
      next: (response) => {
        this.createResult = response;
        this.createState = 'done';
        this.message = response.success ? `${this.resourceType} saved successfully.` : 'Unable to save FHIR resource.';
      },
      error: (error) => {
        this.createState = 'error';
        this.message = error?.error?.message || 'Unable to save FHIR resource.';
      }
    });
  }

  fetchResource(): void {
    if (!this.resourceId.trim()) {
      this.message = 'Enter a resource ID first.';
      return;
    }

    this.fetchState = 'loading';
    this.message = `Loading ${this.resourceType}...`;
    this.fhirService.get(this.resourceType, this.resourceId.trim()).subscribe({
      next: (response) => {
        this.fetchResult = response;
        this.fetchState = 'done';
        this.message = `${this.resourceType} loaded.`;
      },
      error: () => {
        this.fetchState = 'error';
        this.message = `Unable to load ${this.resourceType}.`;
      }
    });
  }

  sendToPayer(): void {
    this.outboundState = 'loading';
    this.message = 'Forwarding resource to payer...';
    this.fhirService.sendToPayer({ payerUrl: this.payerUrl, resourceJson: this.resourceJson }).subscribe({
      next: (response) => {
        this.outboundResult = response;
        this.outboundState = 'done';
        this.message = response.success ? 'Resource forwarded to payer.' : 'Payer request failed.';
      },
      error: () => {
        this.outboundState = 'error';
        this.message = 'Unable to forward resource to payer.';
      }
    });
  }

  useSample(resourceType: FhirResourceType): void {
    this.selectResourceType(resourceType);
  }

  private samplePayload(resourceType: FhirResourceType): string {
    if (resourceType === 'Coverage') {
      return JSON.stringify({
        resourceType: 'Coverage',
        status: 'active',
        beneficiary: { reference: 'Patient/1' },
        payor: [{ display: 'Acme Health' }],
        class: [{ type: { text: 'group' }, value: 'GRP123' }]
      }, null, 2);
    }

    if (resourceType === 'Claim') {
      return JSON.stringify({
        resourceType: 'Claim',
        status: 'active',
        type: { text: 'professional' },
        use: 'claim',
        patient: { reference: 'Patient/1' },
        created: new Date().toISOString(),
        provider: { reference: 'Provider/1' },
        priority: { text: 'normal' },
        item: [{ sequence: 1, productOrService: { text: 'Office visit' } }]
      }, null, 2);
    }

    return JSON.stringify({
      resourceType: 'Patient',
      name: [{ family: 'Doe', given: ['Jane'] }],
      identifier: [{ value: '12345' }],
      gender: 'female',
      birthDate: '1990-01-01'
    }, null, 2);
  }
}