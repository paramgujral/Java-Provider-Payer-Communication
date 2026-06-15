import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MedicalCode {
  code: string;
  description: string;
}

export interface Payer {
  payerId: string;
  companyName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReferenceService {
  private apiUrl = `${environment.apiUrl}/reference`;

  constructor(private http: HttpClient) {}

  searchDiagnosis(query: string): Observable<MedicalCode[]> {
    return this.http.get<MedicalCode[]>(`${this.apiUrl}/diagnosis?query=${encodeURIComponent(query)}`);
  }

  searchProcedures(query: string): Observable<MedicalCode[]> {
    return this.http.get<MedicalCode[]>(`${this.apiUrl}/procedures?query=${encodeURIComponent(query)}`);
  }

  getPayers(): Observable<Payer[]> {
    return this.http.get<Payer[]>(`${this.apiUrl}/payers`);
  }
}
