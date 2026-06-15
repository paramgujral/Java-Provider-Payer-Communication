import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserDto {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.apiUrl);
  }

  toggleUserStatus(id: string, active: boolean): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.apiUrl}/${id}/status?active=${active}`, {});
  }
}
