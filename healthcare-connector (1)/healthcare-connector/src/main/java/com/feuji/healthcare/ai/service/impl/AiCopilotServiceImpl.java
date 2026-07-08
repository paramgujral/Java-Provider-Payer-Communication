package com.feuji.healthcare.ai.service.impl;

import com.feuji.healthcare.ai.dto.AiValidationResponseDto;
import com.feuji.healthcare.ai.enums.AiValidationStatus;
import com.feuji.healthcare.ai.service.AiCopilotService;
import com.feuji.healthcare.authorization.dto.AuthorizationRequestDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AiCopilotServiceImpl
        implements AiCopilotService {

    @Override
    public AiValidationResponseDto validateAuthorizationRequest(
            AuthorizationRequestDto request) {

        List<String> recommendations =
                new ArrayList<>();

        int riskScore = 0;

        if (request.getDiagnosis() == null
                || request.getDiagnosis().isBlank()) {

            recommendations.add(
                    "Diagnosis information is missing.");

            riskScore += 30;
        }

        if (request.getProcedureCode() == null
                || request.getProcedureCode().isBlank()) {

            recommendations.add(
                    "Procedure code is missing.");

            riskScore += 25;
        }

        if (request.getRequestedAmount() == null
                || request.getRequestedAmount()
                .doubleValue() <= 0) {

            recommendations.add(
                    "Requested amount must be greater than zero.");

            riskScore += 25;
        }

        if (request.getRequestedAmount() != null
                && request.getRequestedAmount()
                .doubleValue() > 500000) {

            recommendations.add(
                    "High claim amount detected. Additional review recommended.");

            riskScore += 20;
        }

        AiValidationStatus status;

        if (riskScore == 0) {
            status = AiValidationStatus.VALID;
        } else if (riskScore <= 40) {
            status = AiValidationStatus.WARNING;
        } else {
            status = AiValidationStatus.INVALID;
        }

        return AiValidationResponseDto.builder()
                .status(status)
                .riskScore(riskScore)
                .recommendations(recommendations)
                .build();
    }
}