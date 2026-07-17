import {
  Component,
  HostListener,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { RequestService } from '../../services/request.service';

import { AiCopilotService } from '../../services/aicopilot.service';// AiCopilotService import removed due to missing module; using any for DI

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './provider-dashboard.html',
  styleUrls: ['./provider-dashboard.scss']
})
export class ProviderDashboard implements OnInit {

  constructor(
    private router: Router,
    private requestService: RequestService,
    private aiCopilotService: AiCopilotService
  ) {}

  // Form Fields
  patientName = '';
  diagnosis = '';
  treatment = '';
  estimatedCost = 0;
  payer = '';

  // AI Section
  aiRecommendation = '';
  confidenceScore = 0;
  loadingAi = false;

  // Notifications
  showNotifications = false;
  notifications: string[] = [];

  // Request Table
  requests: any[] = [];

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.requestService.getAllRequests().subscribe({
      next: (data: any) => {
        console.log('FHIR Bundle', data);

        if (data.entry) {
          this.requests = data.entry.map((entry: any) => ({
            id: entry.resource.id,
            patientName:
              entry.resource.patientName || entry.resource.patient?.display || '',
            diagnosis:
              entry.resource.diagnosis?.[0]?.diagnosisCodeableConcept?.text || '',
            treatment:
              entry.resource.item?.[0]?.productOrService?.text || '',
            estimatedCost: entry.resource.total?.value || 0,
            payer: entry.resource.insurer?.display || '',
            status: entry.resource.status || ''
          }));
        }
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigateByUrl('/');
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {

    const target = event.target as HTMLElement;

    if (!target.closest('.notification-container')) {
      this.showNotifications = false;
    }
  }

  validateRequest() {
    const request = {
      patientName: this.patientName,
      diagnosis: this.diagnosis,
      treatment: this.treatment,
      estimatedCost: this.estimatedCost,
      payer: this.payer
    };

    this.aiCopilotService.validate(request).subscribe({
      next: (response: any) => {
        console.log('AI Response', response);

        if (response.issue && response.issue.length > 0) {
          this.aiRecommendation = response.issue[0].details.text;

          if (response.issue.length > 1) {
            const confidenceText = response.issue[1].details.text;
            this.confidenceScore = Number(
              confidenceText
                .replace('Confidence Score:', '')
                .replace('%', '')
                .trim()
            );
          }
        }
      },
      error: (error: any) => {
        console.error(error);
        alert('Failed to validate request');
      }
    });
  }

  submitRequest() {
    const newRequest = {
      patientName: this.patientName,
      diagnosis: this.diagnosis,
      treatment: this.treatment,
      estimatedCost: this.estimatedCost,
      payer: this.payer
    };

    this.requestService.createRequest(newRequest).subscribe({
      next: (response: any) => {
        alert('Authorization Request Submitted Successfully');

        this.notifications.unshift(
          `Request submitted successfully for ${this.patientName}`
        );
        this.notifications.unshift('Request pending review');

        this.loadRequests();

        this.patientName = '';
        this.diagnosis = '';
        this.treatment = '';
        this.estimatedCost = 0;
        this.payer = '';

        this.aiRecommendation = '';
        this.confidenceScore = 0;
      },
      error: (error: any) => {
        console.error(error);
        alert('Failed to submit request');
      }
    });
  }

  markAllAsRead() {
    this.notifications = [];
  }
}