import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  FHIR_BASE_URL,
  bundleResources,
  getParameterValue,
  mapServiceRequestToAuthResponse,
  toFhirPriority
} from '../../core/fhir/fhir.util';

export interface SubmitRequestPayload {
  patientName: string;
  patientId: string;
  insuranceId: string;
  diagnosisCode: string;
  procedureCode: string;
  treatmentDescription: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  priority: string;
}

export interface AuthRequestResponse {
  id: number;
  patientName: string;
  patientId: string;
  insuranceId: string;
  providerName: string;
  providerId: number;
  diagnosisCode: string;
  procedureCode: string;
  treatmentDescription: string;
  admissionDate: string;
  expectedDischargeDate: string;
  priority: string;
  status: string;
  rejectionReason: string;
  reviewNotes: string;
  createdAt: string;
  reviewedAt: string;
}

export interface SuggestionPayload {
  fieldName: string;
  fieldValue: string;
  diagnosisCode: string;
  procedureCode: string;
  treatmentDescription: string;
}

export interface SuggestionResponse {
  suggestion: string;
}

export interface FormAiReviewPayload {
  patientName: string;
  patientId: string;
  insuranceId: string;
  diagnosisCode: string;
  procedureCode: string;
  treatmentDescription: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  priority: string;
}

export interface FieldGuideSuggestion {
  type: 'MISSING' | 'WARNING' | 'SUGGESTION' | string;
  field: string;
  issue: string;
  expected: string;
}

export interface FormAiReviewResult {
  score: number;
  ready: boolean;
  missing: FieldGuideSuggestion[];
  warnings: FieldGuideSuggestion[];
  suggestions: FieldGuideSuggestion[];
}

@Injectable({ providedIn: 'root' })
export class ProviderRequestsService {
  private readonly apiBaseUrl = FHIR_BASE_URL;

  constructor(private http: HttpClient) {}

  reviewWithAi(payload: FormAiReviewPayload): Observable<FormAiReviewResult> {
    const body = {
      resourceType: 'Parameters',
      parameter: [
        { name: 'patientName', valueString: payload.patientName || '' },
        { name: 'patientId', valueString: payload.patientId || '' },
        { name: 'insuranceId', valueString: payload.insuranceId || '' },
        { name: 'diagnosisCode', valueString: payload.diagnosisCode || '' },
        { name: 'procedureCode', valueString: payload.procedureCode || '' },
        { name: 'treatmentDescription', valueString: payload.treatmentDescription || '' },
        { name: 'admissionDate', valueString: payload.admissionDate || '' },
        { name: 'expectedDischargeDate', valueString: payload.expectedDischargeDate || '' },
        { name: 'priority', valueString: payload.priority || '' },
        { name: 'clinicalNotes', valueString: payload.treatmentDescription || '' }
      ]
    };
    return this.http.post<any>(`${this.apiBaseUrl}/$ai-review`, body).pipe(
      map((parameters) => {
        const readyRaw = String(getParameterValue(parameters, 'ready') || 'NO').toUpperCase();
        const list = parameters?.parameter || [];
        const fieldSuggestions = list
          .filter((item: any) => item?.name === 'fieldSuggestion')
          .map((item: any) => {
            const parts = item?.part || [];
            const read = (key: string) => {
              const found = parts.find((p: any) => p?.name === key);
              return found?.valueString != null ? String(found.valueString) : '';
            };
            return {
              type: (read('type') || 'SUGGESTION').toUpperCase(),
              field: read('field'),
              issue: read('issue'),
              expected: read('expected')
            };
          })
          .filter((g: FieldGuideSuggestion) => g.field || g.issue || g.expected);

        return {
          score: Number(getParameterValue(parameters, 'score') || 0),
          ready: readyRaw === 'YES' || readyRaw === 'TRUE',
          missing: fieldSuggestions.filter((g: FieldGuideSuggestion) => g.type === 'MISSING'),
          warnings: fieldSuggestions.filter((g: FieldGuideSuggestion) => g.type === 'WARNING'),
          suggestions: fieldSuggestions.filter((g: FieldGuideSuggestion) => g.type === 'SUGGESTION')
        };
      })
    );
  }

  submitRequest(payload: SubmitRequestPayload): Observable<AuthRequestResponse> {
    const body = {
      resourceType: 'ServiceRequest',
      status: 'active',
      intent: 'order',
      priority: toFhirPriority(payload.priority),
      subject: {
        reference: `Patient/${payload.patientId}`,
        display: payload.patientName
      },
      code: {
        coding: [
          {
            system: 'http://www.ama-assn.org/go/cpt',
            code: payload.procedureCode,
            display: 'Procedure'
          }
        ]
      },
      reasonCode: [
        {
          coding: [
            {
              system: 'http://hl7.org/fhir/sid/icd-10-cm',
              code: payload.diagnosisCode,
              display: 'Diagnosis'
            }
          ]
        }
      ],
      note: payload.treatmentDescription
        ? [{ text: payload.treatmentDescription }]
        : [],
      occurrencePeriod: {
        start: payload.admissionDate,
        ...(payload.expectedDischargeDate
          ? { end: payload.expectedDischargeDate }
          : {})
      },
      extension: [
        {
          url: 'https://healthconn.example.com/fhir/StructureDefinition/patientName',
          valueString: payload.patientName
        },
        {
          url: 'https://healthconn.example.com/fhir/StructureDefinition/insuranceId',
          valueString: payload.insuranceId
        }
      ]
    };

    return this.http
      .post<any>(`${this.apiBaseUrl}/ServiceRequest`, body)
      .pipe(map((resource) => mapServiceRequestToAuthResponse(resource)));
  }

  getMyRequests(): Observable<AuthRequestResponse[]> {
    return this.http
      .get<any>(`${this.apiBaseUrl}/ServiceRequest`)
      .pipe(
        map((bundle) =>
          bundleResources(bundle).map((resource) => mapServiceRequestToAuthResponse(resource))
        )
      );
  }

  getFieldSuggestion(payload: SuggestionPayload): Observable<SuggestionResponse> {
    const body = {
      resourceType: 'Parameters',
      parameter: [
        { name: 'fieldName', valueString: payload.fieldName },
        { name: 'fieldValue', valueString: payload.fieldValue },
        { name: 'diagnosisCode', valueString: payload.diagnosisCode || '' },
        { name: 'procedureCode', valueString: payload.procedureCode || '' },
        { name: 'treatmentDescription', valueString: payload.treatmentDescription || '' }
      ]
    };
    return this.http
      .post<any>(`${this.apiBaseUrl}/$suggest`, body)
      .pipe(
        map((parameters) => ({
          suggestion: String(getParameterValue(parameters, 'suggestion') || '')
        }))
      );
  }
}
