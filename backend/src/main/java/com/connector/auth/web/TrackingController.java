package com.connector.auth.web;

import com.connector.auth.domain.AuthorizationRequest;
import com.connector.auth.mapper.FhirMapper;
import com.connector.auth.service.AuthorizationService;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Status tracking + FHIR resource access for any request. */
@RestController
@RequestMapping("/api/requests")
public class TrackingController {

    private final AuthorizationService service;
    private final FhirMapper fhirMapper;

    public TrackingController(AuthorizationService service, FhirMapper fhirMapper) {
        this.service = service;
        this.fhirMapper = fhirMapper;
    }

    @GetMapping
    public List<AuthorizationRequest> all() { return service.all(); }

    @GetMapping("/{id}")
    public AuthorizationRequest one(@PathVariable Long id) { return service.get(id); }

    /** Full FHIR Bundle (Claim + supporting resources + ClaimResponse if decided). */
    @GetMapping("/{id}/fhir")
    public ObjectNode fhir(@PathVariable Long id) {
        return fhirMapper.toBundle(service.get(id));
    }

    /** Just the FHIR Claim (preauthorization). */
    @GetMapping("/{id}/fhir/claim")
    public ObjectNode claim(@PathVariable Long id) {
        return fhirMapper.toClaim(service.get(id));
    }
}
