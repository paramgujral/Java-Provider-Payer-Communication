package com.healthconnect.provider.service;

import com.healthconnect.common.model.PriorAuthData;
import com.healthconnect.provider.domain.AuthorizationRequest;
import com.healthconnect.provider.web.dto.AuthorizationRequestDto;
import org.springframework.stereotype.Component;

/** Maps between the DTO, the entity and PriorAuthData. */
@Component
public class RequestMapper {

    public void apply(AuthorizationRequestDto dto, AuthorizationRequest entity) {
        entity.setPatientFirstName(dto.patientFirstName());
        entity.setPatientLastName(dto.patientLastName());
        entity.setPatientDob(dto.patientDob());
        entity.setPatientGender(dto.patientGender());
        entity.setMemberId(dto.memberId());
        entity.setPayerName(dto.payerName());
        entity.setInsurancePlan(dto.insurancePlan());
        entity.setProviderName(dto.providerName());
        entity.setProviderNpi(dto.providerNpi());
        entity.setDiagnosisCode(dto.diagnosisCode());
        entity.setDiagnosisDescription(dto.diagnosisDescription());
        entity.setProcedureCode(dto.procedureCode());
        entity.setProcedureDescription(dto.procedureDescription());
        entity.setServiceDate(dto.serviceDate());
        entity.setUrgency(dto.urgency());
        entity.setClinicalJustification(dto.clinicalJustification());
        entity.setRequestedAmount(dto.requestedAmount());
    }

    public PriorAuthData toPriorAuthData(AuthorizationRequest entity) {
        PriorAuthData data = new PriorAuthData();
        data.setRequestNumber(entity.getRequestNumber());
        data.setPatientFirstName(entity.getPatientFirstName());
        data.setPatientLastName(entity.getPatientLastName());
        data.setPatientDob(entity.getPatientDob());
        data.setPatientGender(entity.getPatientGender());
        data.setMemberId(entity.getMemberId());
        data.setPayerName(entity.getPayerName());
        data.setInsurancePlan(entity.getInsurancePlan());
        data.setProviderName(entity.getProviderName());
        data.setProviderNpi(entity.getProviderNpi());
        data.setDiagnosisCode(entity.getDiagnosisCode());
        data.setDiagnosisDescription(entity.getDiagnosisDescription());
        data.setProcedureCode(entity.getProcedureCode());
        data.setProcedureDescription(entity.getProcedureDescription());
        data.setServiceDate(entity.getServiceDate());
        data.setUrgency(entity.getUrgency());
        data.setClinicalJustification(entity.getClinicalJustification());
        data.setRequestedAmount(entity.getRequestedAmount());
        return data;
    }
}
