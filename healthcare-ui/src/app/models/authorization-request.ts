export interface AuthorizationRequest {

  id?: number;

  patientFirstName: string;
  patientLastName: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string;
  email: string;

  insuranceId: string;
  insuranceCompany: string;
  memberId: string;
  policyNumber: string;
  groupNumber: string;

  providerName: string;
  providerNpi: string;
  providerAddress: string;

  diagnosis: string;
  diagnosisCode: string;

  procedureName: string;
  procedureCode: string;

  priority: string;

  requestedDate: string;
  expectedServiceDate: string;

  clinicalNotes: string;

  status?: string;
  aiReview?: string;
  fhirJson?: string;

}