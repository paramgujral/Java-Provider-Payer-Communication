import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Claim } from '../models/claimmodel';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {

  private apiUrl = 'http://localhost:8080/claims';

  constructor(private http: HttpClient) {}

  getAllClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(this.apiUrl);
  }

  getClaimById(id: number): Observable<Claim> {
    return this.http.get<Claim>(`${this.apiUrl}/${id}`);
  }

  submitClaim(claim: Claim): Observable<Claim> {
    return this.http.post<Claim>(this.apiUrl, claim);
  }

  approveClaim(id: number): Observable<Claim> {
    return this.http.put<Claim>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectClaim(id: number, reason: string): Observable<Claim> {
    return this.http.put<Claim>(
      `${this.apiUrl}/${id}/reject`,
      { reason }
    );
  }

  analyzeClaim(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/analyze`);
  }

  exportFHIR(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/fhir`);
  }
  sendEmail(email: string, subject: string, message: string) {
  return this.http.post(
    `http://localhost:8080/notification/send?email=${email}&subject=${subject}&message=${message}`,
    {},
    {responseType:'text'}
  );
}

notifyClaimStatus(claimId: number) {
  return this.http.get(
    `http://localhost:8080/notification/${claimId}/notify`,
    { responseType: 'text' }
  );
}
}