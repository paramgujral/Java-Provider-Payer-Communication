package com.healthcare.fhir.service;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import org.springframework.stereotype.Service;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import ca.uhn.fhir.validation.FhirValidator;
import ca.uhn.fhir.validation.SingleValidationMessage;
import ca.uhn.fhir.validation.ValidationResult;

import org.hl7.fhir.instance.model.api.IBaseResource;

import com.healthcare.fhir.entity.PatientEntity;
import com.healthcare.fhir.repository.PatientRepository;
import com.healthcare.fhir.validation.FhirValidationSupportService;
@Service
public class PatientService {

    private final PatientRepository repository;
    private final FhirContext ctx = FhirContext.forR4();
    private final FhirValidationSupportService validationSupport;

    public PatientService(PatientRepository repository, FhirValidationSupportService validationSupport) {
        this.repository = repository;
        this.validationSupport = validationSupport;
    }

    public String createPatient(String resourceJson) {
        if (resourceJson == null || resourceJson.isBlank()) {
            throw new IllegalArgumentException("Empty resource body");
        }

        IParser parser = ctx.newJsonParser();
        IBaseResource resource = parser.parseResource(resourceJson);

        // Try to validate resource. If validator fails due to missing runtime
        // resources, proceed with saving the parsed resource but surface a warning.
        try {
            FhirValidator validator = ctx.newValidator();
            // attempt to configure extended validation support (non-fatal)
            try { validationSupport.configureValidator(ctx, validator); } catch (Exception ignore) {}
            ValidationResult result = validator.validateWithResult(resource);
            if (result == null) {
                // continue but note could not validate
            } else if (!result.isSuccessful()) {
                StringBuilder sb = new StringBuilder();
                for (SingleValidationMessage msg : result.getMessages()) {
                    sb.append(msg.getSeverity()).append(": ").append(msg.getMessage()).append("; ");
                }
                throw new IllegalArgumentException("FHIR validation failed: " + sb.toString());
            }
        } catch (Exception e) {
            System.err.println("FHIR validator unavailable or failed: " + e.getMessage());
        }

        String id = UUID.randomUUID().toString();
        resource.setId(id);

        // ensure meta
        if (resource.getMeta() != null) {
            resource.getMeta().setVersionId("1");
            resource.getMeta().setLastUpdated(new Date());
        }

        String serialized = parser.encodeResourceToString(resource);

        PatientEntity entity = new PatientEntity();
        entity.setId(id);
        entity.setResource(serialized);
        entity.setVersionId(resource.getMeta() != null ? resource.getMeta().getVersionId() : "1");
        entity.setLastUpdated(Instant.now());

        repository.save(entity);

        return id;
    }

    public String getPatient(String id) {
        return repository.findById(id).map(PatientEntity::getResource).orElse(null);
    }

    public com.healthcare.fhir.dto.FhirValidationResponse validateResource(String resourceJson) {
        IParser parser = ctx.newJsonParser();
        IBaseResource resource = null;
        try {
            resource = parser.parseResource(resourceJson);
        } catch (Exception e) {
            return new com.healthcare.fhir.dto.FhirValidationResponse(false,
                    java.util.List.of(new com.healthcare.fhir.dto.FhirValidationIssue("error", "Failed to parse resource: " + e.getMessage(), null)));
        }

        try {
            FhirValidator validator = ctx.newValidator();
            ValidationResult result = validator.validateWithResult(resource);
            java.util.List<com.healthcare.fhir.dto.FhirValidationIssue> issues = new java.util.ArrayList<>();
            if (result != null) {
                for (SingleValidationMessage msg : result.getMessages()) {
                    String loc = null;
                    if (msg.getLocationString() != null) loc = msg.getLocationString();
                    issues.add(new com.healthcare.fhir.dto.FhirValidationIssue(msg.getSeverity().name(), msg.getMessage(), loc));
                }
            }
            boolean valid = result != null && result.isSuccessful();
            return new com.healthcare.fhir.dto.FhirValidationResponse(valid, issues);
        } catch (Exception e) {
            return new com.healthcare.fhir.dto.FhirValidationResponse(false,
                    java.util.List.of(new com.healthcare.fhir.dto.FhirValidationIssue("error", "Validation failed: " + e.getMessage(), null)));
        }
    }
}
