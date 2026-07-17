import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiCopilotService {

  private apiUrl =
    'http://localhost:8081/fhir/Claim/validate';

  constructor(
    private http: HttpClient
  ) {}

  validate(
    request: any
  ): Observable<any> {

    return this.http.post(
      this.apiUrl,
      request
    );
  }
}