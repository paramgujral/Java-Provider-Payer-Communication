import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private baseUrl = 'http://localhost:8080/notification';

  constructor(private http: HttpClient) {}

  sendEmail(email: string, subject: string, message: string): Observable<string> {

    return this.http.post(
      `${this.baseUrl}/send?email=${email}&subject=${subject}&message=${message}`,
      {},
      { responseType: 'text' }
    );

  }

  notifyClaimStatus(claimId: number): Observable<string> {

    return this.http.get(
      `${this.baseUrl}/${claimId}/notify`,
      { responseType: 'text' }
    );

  }

}