package com.feuji.healthcare.fhir.service.impl;

import com.feuji.healthcare.authorization.entity.AuthorizationRequestEntity;
import com.feuji.healthcare.authorization.repository.AuthorizationRepository;
import com.feuji.healthcare.common.exception.ResourceNotFoundException;
import com.feuji.healthcare.fhir.dto.FhirClaimDto;
import com.feuji.healthcare.fhir.dto.FhirClaimResponseDto;
import com.feuji.healthcare.fhir.dto.FhirCoverageDto;
import com.feuji.healthcare.fhir.dto.FhirPatientDto;
import com.feuji.healthcare.fhir.mapper.*;
import com.feuji.healthcare.fhir.service.FhirService;
import com.feuji.healthcare.fhir.standard.claim.FhirClaimResource;
import com.feuji.healthcare.fhir.standard.claimresponse.FhirClaimResponseResource;
import com.feuji.healthcare.fhir.standard.coverage.FhirCoverageResource;
import com.feuji.healthcare.fhir.standard.patient.FhirPatientResource;
import com.feuji.healthcare.patient.entity.PatientEntity;
import com.feuji.healthcare.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FhirServiceImpl
        implements FhirService {

    private final PatientRepository patientRepository;

    private final AuthorizationRepository authorizationRepository;

    private final FhirClaimMapper fhirClaimMapper;

    private final FhirClaimResponseMapper fhirClaimResponseMapper;

    private final FhirPatientMapper fhirPatientMapper;

    private final FhirCoverageMapper fhirCoverageMapper;

    private final StandardFhirPatientMapper standardFhirPatientMapper;

    @Override
    public FhirPatientDto getPatient(
            Long patientId) {

        PatientEntity patient =
                patientRepository.findById(
                                patientId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient Not Found"));

        return fhirPatientMapper
                .mapToFhirPatient(patient);
    }

    @Override
    public FhirClaimDto getClaim(
            Long authorizationId) {

        AuthorizationRequestEntity authorization =
                authorizationRepository.findById(
                                authorizationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Authorization Request Not Found"));

        return fhirClaimMapper
                .mapToClaim(authorization);
    }


    @Override
    public FhirClaimResponseDto getClaimResponse(
            Long authorizationId) {

        AuthorizationRequestEntity authorization =
                authorizationRepository.findById(
                                authorizationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Authorization Request Not Found"));

        return fhirClaimResponseMapper
                .mapToResponse(authorization);
    }

    @Override
    public FhirCoverageDto getCoverage(
            Long patientId) {

        PatientEntity patient =
                patientRepository.findById(patientId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient Not Found"));

        return fhirCoverageMapper
                .mapToCoverage(patient);
    }

    @Override
    public FhirPatientResource getStandardPatient(
            Long patientId) {

        PatientEntity patient =
                patientRepository.findById(patientId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient Not Found"));

        return standardFhirPatientMapper
                .map(patient);
    }

    @Override
    public FhirClaimResource getStandardClaim(
            Long authorizationId) {

        AuthorizationRequestEntity entity =
                authorizationRepository.findById(
                                authorizationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Authorization Not Found"));

        return FhirClaimResource.builder()
                .resourceType("Claim")
                .id(entity.getRequestNumber())
                .status(entity.getStatus().name())
                .patient(
                        entity.getPatient().getFirstName()
                                + " "
                                + entity.getPatient().getLastName())
                .provider(
                        entity.getProvider().getProviderName())
                .insurer(
                        entity.getPayer().getPayerName())
                .build();
    }

    @Override
    public FhirClaimResponseResource
    getStandardClaimResponse(
            Long authorizationId) {

        AuthorizationRequestEntity entity =
                authorizationRepository.findById(
                                authorizationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Authorization Not Found"));

        return FhirClaimResponseResource
                .builder()
                .resourceType("ClaimResponse")
                .claimNumber(
                        entity.getRequestNumber())
                .outcome(
                        entity.getStatus().name())
                .rejectionReason(
                        entity.getRejectionReason())
                .build();
    }

    @Override
    public FhirCoverageResource
    getStandardCoverage(
            Long patientId) {

        PatientEntity patient =
                patientRepository.findById(patientId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Patient Not Found"));

        return FhirCoverageResource.builder()
                .resourceType("Coverage")
                .policyNumber(
                        patient.getPolicyNumber())
                .patient(
                        patient.getFirstName()
                                + " "
                                + patient.getLastName())
                .payer(
                        "Star Health Insurance")
                .status("ACTIVE")
                .build();
    }
}