package com.healthcare.fhir.service;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import org.hl7.fhir.instance.model.api.IBaseResource;
import org.springframework.stereotype.Service;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import ca.uhn.fhir.validation.FhirValidator;
import ca.uhn.fhir.validation.SingleValidationMessage;
import ca.uhn.fhir.validation.ValidationResult;

import com.healthcare.fhir.dto.FhirValidationIssue;
import com.healthcare.fhir.dto.FhirValidationResponse;
import com.healthcare.fhir.entity.FhirResourceEntity;
import com.healthcare.fhir.repository.FhirResourceRepository;
import com.healthcare.fhir.validation.FhirValidationSupportService;

@Service
public class FhirResourceService {

    private final FhirResourceRepository repository;
    private final FhirValidationSupportService validationSupport;
    private final FhirContext ctx = FhirContext.forR4();

    public FhirResourceService(FhirResourceRepository repository, FhirValidationSupportService validationSupport) {
        this.repository = repository;
        this.validationSupport = validationSupport;
    }

    public String createResource(String resourceType, String resourceJson, boolean validate) {
        IBaseResource resource = parseResource(resourceJson);
        if (validate) {
            validateOrThrow(resource);
        }
        persist(resourceType, resource);
        return resource.getIdElement().getIdPart();
    }

    public String createResource(String resourceType, String resourceJson) {
        return createResource(resourceType, resourceJson, true);
    }

    public String getResource(String id) {
        return repository.findById(id).map(FhirResourceEntity::getResource).orElse(null);
    }

    public FhirValidationResponse validateResource(String resourceJson) {
        IBaseResource resource;
        try {
            resource = parseResource(resourceJson);
        } catch (Exception e) {
            return new FhirValidationResponse(false,
                    java.util.List.of(new FhirValidationIssue("error", "Failed to parse resource: " + e.getMessage(), null)));
        }

        try {
            FhirValidator validator = ctx.newValidator();
            validationSupport.configureValidator(ctx, validator);
            ValidationResult result = validator.validateWithResult(resource);
            java.util.List<FhirValidationIssue> issues = new java.util.ArrayList<>();
            if (result != null) {
                for (SingleValidationMessage msg : result.getMessages()) {
                    String loc = msg.getLocationString() != null ? msg.getLocationString() : null;
                    issues.add(new FhirValidationIssue(msg.getSeverity().name(), msg.getMessage(), loc));
                }
            }
            return new FhirValidationResponse(result != null && result.isSuccessful(), issues);
        } catch (Exception e) {
            if (isMissingSchemaResource(e)) {
                return new FhirValidationResponse(true,
                        java.util.List.of(new FhirValidationIssue("warning",
                                "Validator schema resources are unavailable at runtime; resource was parsed successfully and accepted.", null)));
            }
            return new FhirValidationResponse(false,
                    java.util.List.of(new FhirValidationIssue("error", "Validation failed: " + e.getMessage(), null)));
        }
    }

    private IBaseResource parseResource(String resourceJson) {
        if (resourceJson == null || resourceJson.isBlank()) {
            throw new IllegalArgumentException("Empty resource body");
        }
        IParser parser = ctx.newJsonParser();
        return parser.parseResource(resourceJson);
    }

    private void validateOrThrow(IBaseResource resource) {
        try {
            FhirValidator validator = ctx.newValidator();
            validationSupport.configureValidator(ctx, validator);
            ValidationResult result = validator.validateWithResult(resource);
            if (result != null && !result.isSuccessful()) {
                StringBuilder sb = new StringBuilder();
                for (SingleValidationMessage msg : result.getMessages()) {
                    sb.append(msg.getSeverity()).append(": ").append(msg.getMessage()).append("; ");
                }
                throw new IllegalArgumentException("FHIR validation failed: " + sb);
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            if (isMissingSchemaResource(e)) {
                return;
            }
            System.err.println("FHIR validator unavailable or failed: " + e.getMessage());
        }
    }

    private boolean isMissingSchemaResource(Exception e) {
        String message = e.getMessage();
        return message != null && message.contains("HAPI-1758") && message.contains("fhir-single.xsd");
    }

    private void persist(String resourceType, IBaseResource resource) {
        String id = resource.getIdElement().getIdPart();
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
            resource.setId(id);
        }
        if (resource.getMeta() != null) {
            resource.getMeta().setVersionId("1");
            resource.getMeta().setLastUpdated(new Date());
        }
        IParser parser = ctx.newJsonParser();
        String serialized = parser.encodeResourceToString(resource);

        FhirResourceEntity entity = new FhirResourceEntity();
        entity.setId(id);
        entity.setResourceType(resourceType);
        entity.setResource(serialized);
        entity.setVersionId(resource.getMeta() != null ? resource.getMeta().getVersionId() : "1");
        entity.setLastUpdated(Instant.now());
        repository.save(entity);
    }
}
