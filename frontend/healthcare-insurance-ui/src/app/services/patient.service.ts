import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api-config';

export interface PatientDTO {
  id?: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  age?: number;
  gender: string;
  phone?: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/patients`;

  list(): Observable<PatientDTO[]> {
    return this.http.get<PatientDTO[]>(this.baseUrl);
  }

  get(id: string): Observable<PatientDTO> {
    return this.http.get<PatientDTO>(`${this.baseUrl}/${id}`);
  }

  create(payload: PatientDTO): Observable<PatientDTO> {
    return this.http.post<PatientDTO>(this.baseUrl, payload);
  }

  update(id: string, payload: PatientDTO): Observable<PatientDTO> {
    return this.http.put<PatientDTO>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
