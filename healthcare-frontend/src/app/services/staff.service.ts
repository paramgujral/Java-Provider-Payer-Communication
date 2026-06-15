import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StaffMember {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  active: boolean;
}

export interface CreateStaffRequest {
  firstName: string;
  lastName: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private apiUrl = `${environment.apiUrl}/organization/users`;

  constructor(private http: HttpClient) {}

  getStaffMembers(): Observable<StaffMember[]> {
    return this.http.get<StaffMember[]>(this.apiUrl);
  }

  addStaffMember(data: CreateStaffRequest): Observable<StaffMember> {
    return this.http.post<StaffMember>(this.apiUrl, data);
  }

  toggleStaffStatus(userId: string, active: boolean): Observable<StaffMember> {
    return this.http.put<StaffMember>(`${this.apiUrl}/${userId}/status?active=${active}`, {});
  }
}
