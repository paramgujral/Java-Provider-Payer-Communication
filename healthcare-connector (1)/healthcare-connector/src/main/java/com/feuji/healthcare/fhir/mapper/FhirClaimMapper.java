package com.feuji.healthcare.fhir.mapper;

import com.feuji.healthcare.authorization.entity.AuthorizationRequestEntity;
import com.feuji.healthcare.fhir.dto.FhirClaimDto;
import org.springframework.stereotype.Component;

@Component
public class FhirClaimMapper {

    public FhirClaimDto mapToClaim(
            AuthorizationRequestEntity entity) {

        return FhirClaimDto.builder()
                .resourceType("Claim")
                .claimNumber(
                        entity.getRequestNumber())
                .patientName(
                        entity.getPatient().getFirstName()
                                + " "
                                + entity.getPatient().getLastName())
                .providerName(
                        entity.getProvider().getProviderName())
                .payerName(
                        entity.getPayer().getPayerName())
                .diagnosis(
                        entity.getDiagnosis())
                .procedureCode(
                        entity.getProcedureCode())
                .requestedAmount(
                        entity.getRequestedAmount())
                .status(
                        entity.getStatus().name())
                .build();
    }
}