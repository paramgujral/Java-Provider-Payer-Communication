package com.example.healthcareconnector.service;

import com.example.healthcareconnector.entity.AuthorizationRequest;
import com.example.healthcareconnector.repository.AuthorizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class FhirService {

    private final AuthorizationRepository  authorizationRepository;

    public Map<String, Object> convertToFHIR(Long id) {
        AuthorizationRequest request = authorizationRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Authorization Request Not Found")
                );

        return Map.of("resourceType", "Claim",
                "id", request.getId(),
                "patient", Map.of("name", request.getPatientName()),
                "diagnosis", Map.of("description", request.getDiagnosis()),
                "procedure", Map.of("code", request.getProcedureCode()),
                "supportingInfo", Map.of("documentAttached", request.isDocumentAttached()),
                "status", request.getStatus().toString()
        );
    }
}
