import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface AiReviewPayload {
  patientName: string;
  insuranceCompany: string;
  policyNumber: string;
  memberId: string;
  coverageType: string;
  doctorName: string;
  npiNumber: string;
  hospital: string;
  specialty: string;
  diagnosis: string;
  icd10Code: string;
  procedureName: string;
  cptCode: string;
  reasonForAuthorization: string;
  mriReport: string;
  labReport: string;
  prescription: string;
  medicalHistory: string;
}

export interface AiReviewResponse {
  score: number;
  missing: string[];
  warnings: string[];
  readyForSubmission: boolean;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private api = environment.apiUrl + '/ai';

  constructor(private http: HttpClient) {}

  summarize(text: string): Observable<any> {
    return this.http.post<any>(this.api + '/summarize', { requestText: text });
  }

  recommend(text: string): Observable<any> {
    return this.http.post<any>(this.api + '/recommend', { requestText: text });
  }

  validate(text: string): Observable<any> {
    return this.http.post<any>(this.api + '/validate', { requestText: text });
  }

  detectMissingFields(text: string): Observable<any> {
    return this.http.post<any>(this.api + '/missing-fields', { requestText: text });
  }

  review(payload: AiReviewPayload): Observable<{ success: boolean; message: string; data: AiReviewResponse }> {
    return this.http.post<{ success: boolean; message: string; data: AiReviewResponse }>(this.api + '/review', payload);
  }
}
