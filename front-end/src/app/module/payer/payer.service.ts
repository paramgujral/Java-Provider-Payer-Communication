import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  FHIR_BASE_URL,
  bundleResources,
  mapServiceRequestToAuthResponse
} from '../../core/fhir/fhir.util';

export interface PayerRequest {
  id: number;
  patientName: string;
  patientId: string;
  insuranceId: string;
  providerName: string;
  providerId: number;
  diagnosisCode: string;
  procedureCode: string;
  treatmentDescription: string;
  admissionDate: string;
  expectedDischargeDate: string;
  priority: string;
  status: string;
  rejectionReason: string;
  reviewNotes: string;
  createdAt: string;
  reviewedAt: string;
}

export interface ReviewPayload {
  decision: 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
  rejectionReason?: string;
}

@Injectable({ providedIn: 'root' })
export class PayerWorkflowService {
  private readonly apiBaseUrl = FHIR_BASE_URL;

  constructor(private http: HttpClient) {}

  getPendingRequests(): Observable<PayerRequest[]> {
    return this.http
      .get<any>(`${this.apiBaseUrl}/ServiceRequest/$queue`)
      .pipe(
        map((bundle) =>
          bundleResources(bundle).map((resource) => mapServiceRequestToAuthResponse(resource))
        )
      );
  }

  getAllRequests(): Observable<PayerRequest[]> {
    return this.http
      .get<any>(`${this.apiBaseUrl}/ServiceRequest/$history`)
      .pipe(
        map((bundle) =>
          bundleResources(bundle).map((resource) => mapServiceRequestToAuthResponse(resource))
        )
      );
  }

  reviewRequest(id: number, payload: ReviewPayload): Observable<PayerRequest> {
    const body = {
      resourceType: 'ClaimResponse',
      status: 'active',
      outcome: payload.decision === 'APPROVED' ? 'complete' : 'error',
      disposition: payload.decision === 'APPROVED' ? 'Approved' : 'Rejected',
      request: {
        reference: `ServiceRequest/${id}`
      },
      processNote: payload.reviewNotes ? [{ text: payload.reviewNotes }] : [],
      extension: payload.rejectionReason
        ? [
            {
              url: 'https://healthconn.example.com/fhir/StructureDefinition/rejectionReason',
              valueString: payload.rejectionReason
            }
          ]
        : []
    };

    return this.http
      .post<any>(`${this.apiBaseUrl}/ClaimResponse`, body)
      .pipe(
        map((claimResponse) => ({
          id,
          patientName: claimResponse?.patient?.display || '',
          patientId: '',
          insuranceId: '',
          providerName: '',
          providerId: 0,
          diagnosisCode: '',
          procedureCode: '',
          treatmentDescription: '',
          admissionDate: '',
          expectedDischargeDate: '',
          priority: 'NORMAL',
          status: payload.decision,
          rejectionReason: payload.rejectionReason || '',
          reviewNotes: payload.reviewNotes || '',
          createdAt: claimResponse?.meta?.lastUpdated || '',
          reviewedAt: claimResponse?.meta?.lastUpdated || ''
        }))
      );
  }
}
