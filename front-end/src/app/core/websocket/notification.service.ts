import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SKIP_GLOBAL_LOADER } from '../loader/global-loader.interceptor';
import {
  FHIR_BASE_URL,
  bundleResources,
  getParameterValue,
  mapCommunicationToNotification
} from '../fhir/fhir.util';

export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  type: string;
  requestId: number;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationCenterService {
  private readonly apiBaseUrl = FHIR_BASE_URL;

  constructor(private http: HttpClient) {}

  getMyNotifications(_skipLoader = true): Observable<NotificationDto[]> {
    const options = {
      headers: new HttpHeaders().set(SKIP_GLOBAL_LOADER, 'true')
    };
    return this.http
      .get<any>(`${this.apiBaseUrl}/Communication`, options)
      .pipe(
        map((bundle) =>
          bundleResources(bundle).map((resource) => mapCommunicationToNotification(resource))
        )
      );
  }

  getUnreadCount(_skipLoader = true): Observable<{ count: number }> {
    const options = {
      headers: new HttpHeaders().set(SKIP_GLOBAL_LOADER, 'true')
    };
    return this.http
      .get<any>(`${this.apiBaseUrl}/Communication/$unread-count`, options)
      .pipe(
        map((parameters) => ({
          count: Number(getParameterValue(parameters, 'count') || 0)
        }))
      );
  }

  markAllRead(): Observable<void> {
    const body = {
      resourceType: 'Parameters',
      parameter: [{ name: 'action', valueString: 'mark-all-read' }]
    };
    return this.http
      .put<any>(`${this.apiBaseUrl}/Communication/$mark-all-read`, body)
      .pipe(map(() => undefined));
  }

  markOneRead(id: number, item?: NotificationDto): Observable<void> {
    const body = {
      resourceType: 'Communication',
      id: String(id),
      status: 'completed',
      payload: [
        {
          contentString: item
            ? `${item.title || ''}: ${item.message || ''}`
            : `Communication/${id}`
        }
      ],
      extension: [
        {
          url: 'https://healthconn.example.com/fhir/StructureDefinition/isRead',
          valueBoolean: true
        },
        {
          url: 'https://healthconn.example.com/fhir/StructureDefinition/title',
          valueString: item?.title || ''
        },
        {
          url: 'https://healthconn.example.com/fhir/StructureDefinition/type',
          valueString: item?.type || ''
        }
      ]
    };
    return this.http
      .put<any>(`${this.apiBaseUrl}/Communication/${id}`, body)
      .pipe(map(() => undefined));
  }
}
