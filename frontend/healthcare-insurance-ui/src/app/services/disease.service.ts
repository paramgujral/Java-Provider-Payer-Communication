import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api-config';

export interface DiseaseDTO {
  id?: string;
  diseaseCode: string;
  diseaseName: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class DiseaseService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${API_CONFIG.baseUrl}/diseases`;

  list(): Observable<DiseaseDTO[]> {
    return this.http.get<DiseaseDTO[]>(this.baseUrl);
  }

  get(id: string): Observable<DiseaseDTO> {
    return this.http.get<DiseaseDTO>(`${this.baseUrl}/${id}`);
  }

  create(payload: DiseaseDTO): Observable<DiseaseDTO> {
    return this.http.post<DiseaseDTO>(this.baseUrl, payload);
  }

  update(id: string, payload: DiseaseDTO): Observable<DiseaseDTO> {
    return this.http.put<DiseaseDTO>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
