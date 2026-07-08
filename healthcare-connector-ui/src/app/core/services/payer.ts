import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PayerService {

  private apiUrl =
    'http://localhost:8080/api/v1/payers';

  constructor(
    private http: HttpClient
  ) {}

  getAllPayers(): Observable<any> {

    return this.http.get(this.apiUrl);

  }

  createPayer(
    payload: any
  ): Observable<any> {

    return this.http.post(
      this.apiUrl,
      payload
    );

  }
}