import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/models';
import { Analytics } from '../models/analytics.models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private base = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getAnalytics(): Observable<Analytics> {
    return this.http.get<ApiResponse<Analytics>>(this.base)
      .pipe(map(r => r.data));
  }
}
