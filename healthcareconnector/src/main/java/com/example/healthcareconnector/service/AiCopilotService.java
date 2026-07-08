package com.example.healthcareconnector.service;

import com.example.healthcareconnector.entity.AuthorizationRequest;
import org.springframework.stereotype.Service;

@Service
public class AiCopilotService {

    public String validateAuthorization(AuthorizationRequest request){

        if(request.getPatientName()==null || request.getPatientName().isBlank()){
            return "Patient information missing. Please provide patient details.";
        }

        if(request.getDiagnosis()==null || request.getDiagnosis().isBlank()){
            return "Diagnosis missing. Add diagnosis information before submitting.";
        }

        if(request.getProcedureCode()==null || request.getProcedureCode().isBlank()){
            return "Procedure code missing. Add valid medical procedure code.";
        }

        if(!request.isDocumentAttached()){
            return "Medical document missing. Attach supporting documents.";
        }

        return "APPROVED_BY_AI";

    }
}
