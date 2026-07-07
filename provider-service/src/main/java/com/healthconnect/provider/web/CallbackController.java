package com.healthconnect.provider.web;

import com.healthconnect.common.fhir.PriorAuthFhirMapper;
import com.healthconnect.common.model.DecisionData;
import com.healthconnect.provider.domain.AuthorizationRequest;
import com.healthconnect.provider.service.AuthorizationRequestService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** Receives decision ClaimResponses from the payer. */
@RestController
@RequestMapping("/api/callbacks")
public class CallbackController {

    private final AuthorizationRequestService service;
    private final PriorAuthFhirMapper fhirMapper;

    public CallbackController(AuthorizationRequestService service, PriorAuthFhirMapper fhirMapper) {
        this.service = service;
        this.fhirMapper = fhirMapper;
    }

    @PostMapping(value = "/decision", consumes = {"application/fhir+json", "application/json"})
    public Map<String, Object> decision(@RequestBody String claimResponseJson) {
        DecisionData decision = fhirMapper.fromClaimResponseJson(claimResponseJson);
        AuthorizationRequest updated = service.applyDecision(decision);
        return Map.of(
                "requestNumber", updated.getRequestNumber(),
                "status", updated.getStatus());
    }
}
