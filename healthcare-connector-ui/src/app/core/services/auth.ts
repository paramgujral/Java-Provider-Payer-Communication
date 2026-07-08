import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  login(payload: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/login`,
      payload
    );
  }
}