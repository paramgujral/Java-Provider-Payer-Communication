import { environment } from '../../../environments/environment';

export const FHIR_BASE_URL = environment.apiBaseUrl;

export function getExtensionValue(resource: any, suffix: string): string | null {
  const extensions = resource?.extension || [];
  const url = `https://healthconn.example.com/fhir/StructureDefinition/${suffix}`;
  const found = extensions.find((item: any) => item?.url === url);
  if (!found) return null;
  if (found.valueString != null) return String(found.valueString);
  if (found.valueBoolean != null) return String(found.valueBoolean);
  if (found.value != null) return String(found.value);
  return null;
}

export function getExtensionObject(resource: any, suffix: string): any {
  const extensions = resource?.extension || [];
  const url = `https://healthconn.example.com/fhir/StructureDefinition/${suffix}`;
  const found = extensions.find((item: any) => item?.url === url);
  return found?.value ?? null;
}

export function getParameterValue(parameters: any, name: string): any {
  const list = parameters?.parameter || [];
  const found = list.find((item: any) => item?.name === name);
  if (!found) return null;
  if (found.valueString != null) return found.valueString;
  if (found.valueInteger != null) return found.valueInteger;
  if (found.valueCode != null) return found.valueCode;
  if (found.valueBoolean != null) return found.valueBoolean;
  return found.value ?? null;
}

export function bundleResources(bundle: any): any[] {
  return (bundle?.entry || []).map((entry: any) => entry.resource).filter(Boolean);
}

export function firstCoding(codeable: any): string {
  return codeable?.coding?.[0]?.code || codeable?.text || '';
}

export function referenceId(reference: any): string {
  const value = reference?.reference || '';
  return value.includes('/') ? value.substring(value.lastIndexOf('/') + 1) : value;
}

export function toUiPriority(fhirPriority: string): string {
  if (fhirPriority === 'urgent') return 'URGENT';
  if (fhirPriority === 'asap' || fhirPriority === 'stat') return 'EMERGENCY';
  return 'NORMAL';
}

export function toFhirPriority(priority: string): string {
  if (priority === 'URGENT') return 'urgent';
  if (priority === 'EMERGENCY') return 'asap';
  return 'routine';
}

export function toUiStatus(fhirStatus: string): string {
  switch (fhirStatus) {
    case 'draft': return 'DRAFT';
    case 'active': return 'SUBMITTED';
    case 'completed': return 'APPROVED';
    case 'revoked': return 'REJECTED';
    default: return (fhirStatus || '').toUpperCase();
  }
}

export function mapServiceRequestToAuthResponse(resource: any): any {
  return {
    id: Number(resource.id),
    patientName: getExtensionValue(resource, 'patientName') || resource?.subject?.display || '',
    patientId: referenceId(resource.subject),
    insuranceId: getExtensionValue(resource, 'insuranceId') || '',
    providerName: resource?.requester?.display || '',
    providerId: Number(referenceId(resource.requester) || 0),
    diagnosisCode: firstCoding(resource?.reasonCode?.[0]),
    procedureCode: firstCoding(resource?.code),
    treatmentDescription: resource?.note?.[0]?.text || '',
    admissionDate: resource?.occurrencePeriod?.start || '',
    expectedDischargeDate: resource?.occurrencePeriod?.end || '',
    priority: toUiPriority(resource?.priority),
    status: toUiStatus(resource?.status),
    rejectionReason: getExtensionValue(resource, 'rejectionReason') || '',
    reviewNotes: getExtensionValue(resource, 'reviewNotes') || '',
    createdAt: resource?.meta?.lastUpdated || '',
    reviewedAt: ''
  };
}

export function mapCommunicationToNotification(resource: any): any {
  const payloadText = resource?.payload?.[0]?.contentString || '';
  const separator = payloadText.indexOf(': ');
  const titleFromPayload = separator >= 0 ? payloadText.substring(0, separator) : payloadText;
  const messageFromPayload = separator >= 0 ? payloadText.substring(separator + 2) : '';
  return {
    id: Number(resource.id),
    title: getExtensionValue(resource, 'title') || titleFromPayload,
    message: messageFromPayload || payloadText,
    type: getExtensionValue(resource, 'type') || '',
    requestId: Number(referenceId(resource?.about?.[0]) || 0),
    isRead: resource?.status === 'completed' || getExtensionValue(resource, 'isRead') === 'true',
    createdAt: resource?.sent || resource?.meta?.lastUpdated || ''
  };
}

export function mapMeasureReportToDashboard(resource: any): any {
  const groups = resource?.group || [];
  const valueFor = (code: string) => {
    const found = groups.find((g: any) => g?.code?.text === code);
    return Number(found?.measureScore?.value || 0);
  };
  return {
    totalRequests: valueFor('totalRequests'),
    submitted: valueFor('submitted'),
    underReview: valueFor('underReview'),
    approved: valueFor('approved'),
    rejected: valueFor('rejected'),
    statusDistribution: getExtensionObject(resource, 'statusDistribution') || [],
    monthlyByPriority: getExtensionObject(resource, 'monthlyByPriority') || [],
    providerSummary: getExtensionObject(resource, 'providerSummary') || [],
    payerSummary: getExtensionObject(resource, 'payerSummary') || []
  };
}

