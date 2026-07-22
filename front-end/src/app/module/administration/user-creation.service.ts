import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FHIR_BASE_URL, getExtensionValue } from '../../core/fhir/fhir.util';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'PROVIDER' | 'PAYER';
  enabled?: boolean;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  fullName: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserAdministrationService {
  private readonly apiBaseUrl = FHIR_BASE_URL;

  constructor(private http: HttpClient) {}

  register(payload: RegisterRequest): Observable<AuthResponse> {
    const nameParts = (payload.fullName || '').trim().split(/\s+/);
    const family = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0] || '';
    const given = nameParts.length > 1 ? nameParts.slice(0, -1) : [family];

    const body = {
      resourceType: 'Practitioner',
      identifier: [
        {
          system: 'https://healthconn.example.com/users',
          value: payload.email
        }
      ],
      active: payload.enabled !== false,
      name: [
        {
          use: 'official',
          text: payload.fullName,
          family,
          given
        }
      ],
      extension: [
        {
          url: 'https://healthconn.example.com/fhir/StructureDefinition/password',
          valueString: payload.password
        },
        {
          url: 'https://healthconn.example.com/fhir/StructureDefinition/role',
          valueString: payload.role
        }
      ]
    };

    return this.http.post<any>(`${this.apiBaseUrl}/Practitioner`, body).pipe(
      map((practitioner) => ({
        token: '',
        userId: Number(String(practitioner?.id || '').replace('PRAC-', '') || 0),
        email: practitioner?.identifier?.[0]?.value || payload.email,
        fullName: practitioner?.name?.[0]?.text || payload.fullName,
        role: getExtensionValue(practitioner, 'role') || payload.role
      }))
    );
  }
}
