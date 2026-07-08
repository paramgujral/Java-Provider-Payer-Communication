package com.feuji.healthcare.fhir.service;

import com.feuji.healthcare.fhir.dto.FhirClaimDto;
import com.feuji.healthcare.fhir.dto.FhirClaimResponseDto;
import com.feuji.healthcare.fhir.dto.FhirCoverageDto;
import com.feuji.healthcare.fhir.dto.FhirPatientDto;
import com.feuji.healthcare.fhir.standard.claim.FhirClaimResource;
import com.feuji.healthcare.fhir.standard.claimresponse.FhirClaimResponseResource;
import com.feuji.healthcare.fhir.standard.coverage.FhirCoverageResource;
import com.feuji.healthcare.fhir.standard.patient.FhirPatientResource;

public interface FhirService {

    FhirPatientDto getPatient(Long patientId);

    FhirClaimDto getClaim(Long authorizationId);

    FhirClaimResponseDto getClaimResponse(
            Long authorizationId);

    FhirCoverageDto getCoverage(Long patientId);

    FhirPatientResource getStandardPatient(Long patientId);

    FhirClaimResource getStandardClaim(Long authorizationId);

    FhirClaimResponseResource getStandardClaimResponse(Long authorizationId);

    FhirCoverageResource getStandardCoverage(Long patientId);
}