package com.healthconn.healthcare_connector.authentication.controller;

import com.healthconn.healthcare_connector.authentication.dto.AuthModels.AuthResponse;
import com.healthconn.healthcare_connector.authentication.dto.AuthModels.LoginRequest;
import com.healthconn.healthcare_connector.authentication.dto.AuthModels.RegisterRequest;
import com.healthconn.healthcare_connector.authentication.service.AuthService;
import com.healthconn.healthcare_connector.fhir.FhirMapper;
import com.healthconn.healthcare_connector.fhir.FhirMediaTypes;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * FHIR-style auth endpoints.
 * Register  -> Practitioner
 * Login     -> Parameters ($login)
 * Metadata  -> CapabilityStatement
 */
@RestController
@RequestMapping(produces = {FhirMediaTypes.FHIR_JSON, FhirMediaTypes.JSON})
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final FhirMapper fhirMapper;

    @PostMapping(value = "/fhir/Practitioner",
            consumes = {FhirMediaTypes.FHIR_JSON, FhirMediaTypes.JSON})
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> practitioner) {
        RegisterRequest request = fhirMapper.toRegisterRequest(practitioner);
        AuthResponse auth = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(fhirMapper.toPractitioner(auth));
    }

    // /fhir/login is the primary path (Spring Security antMatchers mishandles '$').
    // /fhir/$login kept as FHIR-style alias.
    @PostMapping(value = {"/fhir/login", "/fhir/$login"},
            consumes = {FhirMediaTypes.FHIR_JSON, FhirMediaTypes.JSON})
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, Object> parameters) {
        try {
            LoginRequest request = fhirMapper.toLoginRequest(parameters);
            AuthResponse auth = authService.login(request);
            return ResponseEntity.ok(fhirMapper.toAuthParameters(auth));
        } catch (org.springframework.security.authentication.BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    java.util.Collections.<String, Object>singletonMap("resourceType", "OperationOutcome"));
        }
    }

    @GetMapping("/fhir/metadata")
    public ResponseEntity<Map<String, Object>> metadata() {
        return ResponseEntity.ok(fhirMapper.toCapabilityStatement());
    }
}
