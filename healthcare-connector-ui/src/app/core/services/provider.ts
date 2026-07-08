import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {

  private apiUrl =
    'http://localhost:8080/api/v1/providers';

  constructor(
    private http: HttpClient
  ) {}

  getAllProviders(): Observable<any> {

    return this.http.get(this.apiUrl);

  }

  createProvider(
    payload: any
  ): Observable<any> {

    return this.http.post(
      this.apiUrl,
      payload
    );

  }
}