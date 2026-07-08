package com.feuji.healthcare.fhir.mapper;

import com.feuji.healthcare.authorization.entity.AuthorizationRequestEntity;
import com.feuji.healthcare.fhir.dto.FhirClaimResponseDto;
import org.springframework.stereotype.Component;

@Component
public class FhirClaimResponseMapper {

    public FhirClaimResponseDto mapToResponse(
            AuthorizationRequestEntity entity) {

        return FhirClaimResponseDto.builder()
                .resourceType("ClaimResponse")
                .claimNumber(
                        entity.getRequestNumber())
                .outcome(
                        entity.getStatus().name())
                .decision(
                        entity.getStatus().name())
                .rejectionReason(
                        entity.getRejectionReason())
                .build();
    }
}