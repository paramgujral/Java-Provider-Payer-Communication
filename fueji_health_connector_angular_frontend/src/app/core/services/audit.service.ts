import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLog } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = `${environment.apiUrl}/api/audit`;

  constructor(private http: HttpClient) {}

  getAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.apiUrl);
  }

  getAuditLogById(id: string): Observable<AuditLog> {
    return this.http.get<AuditLog>(`${this.apiUrl}/${id}`);
  }

  getAuditLogsByUser(userId: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/user/${userId}`);
  }

  getAuditLogsByEntity(entity: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/entity/${entity}`);
  }
}
