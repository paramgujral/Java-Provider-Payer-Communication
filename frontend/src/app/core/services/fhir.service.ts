import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export type FhirResourceType = 'Patient' | 'Coverage' | 'Claim';

export interface FhirValidationIssue {
  severity: string;
  message: string;
  location?: string | null;
}

export interface FhirValidationResponse {
  valid: boolean;
  issues: FhirValidationIssue[];
}

export interface FhirValidationStatus {
  configured: boolean;
  remoteBaseUrl: string | null;
  messages: string[];
  loadedDefinitions: number;
}

export interface FhirCreateResponse {
  success: boolean;
  message: string;
  id: string | null;
  validation: FhirValidationResponse | null;
}

export interface FhirOutboundRequest {
  payerUrl: string;
  resourceJson: string;
}

export interface FhirOutboundResponse {
  success: boolean;
  httpStatus: number;
  message: string;
  responseBody: string;
}

@Injectable({ providedIn: 'root' })
export class FhirService {
  private api = environment.apiUrl + '/fhir';

  constructor(private http: HttpClient) {}

  getValidationStatus(): Observable<FhirValidationStatus> {
    return this.http.get<FhirValidationStatus>(this.api + '/validation/status');
  }

  validate(resourceType: FhirResourceType, resourceJson: string): Observable<FhirValidationResponse> {
    return this.http.post<FhirValidationResponse>(this.endpoint(resourceType) + '/validate', resourceJson, {
      headers: { 'Content-Type': 'application/fhir+json' }
    });
  }

  create(resourceType: FhirResourceType, resourceJson: string, validate = false): Observable<FhirCreateResponse> {
    return this.http.post<FhirCreateResponse>(this.endpoint(resourceType) + `?validate=${validate}`, resourceJson, {
      headers: { 'Content-Type': 'application/fhir+json' }
    });
  }

  get(resourceType: FhirResourceType, id: string): Observable<string> {
    return this.http.get(this.endpoint(resourceType) + '/' + encodeURIComponent(id), { responseType: 'text' });
  }

  sendToPayer(payload: FhirOutboundRequest): Observable<FhirOutboundResponse> {
    return this.http.post<FhirOutboundResponse>(this.api + '/outbound', payload);
  }

  private endpoint(resourceType: FhirResourceType): string {
    return this.api + '/' + resourceType.toLowerCase();
  }
}