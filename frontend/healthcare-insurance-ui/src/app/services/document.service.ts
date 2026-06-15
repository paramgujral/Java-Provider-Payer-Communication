import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api-config';

export interface DocumentDTO {
  id?: string;
  fileName?: string;
  filePath?: string;
  documentType?: string;
  claimId?: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);

  private readonly baseUrl = `${API_CONFIG.baseUrl}/claim-documents`;

  listByClaimId(claimId: string): Observable<DocumentDTO[]> {
    return this.http.get<DocumentDTO[]>(`${this.baseUrl}/claims/${claimId}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
