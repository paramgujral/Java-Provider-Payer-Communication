package com.healthcare.authorization.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.ai.dto.AiReviewResponse;
import com.healthcare.audit.service.AuditLogService;
import com.healthcare.authorization.dto.AuthorizationDecisionRequest;
import com.healthcare.authorization.dto.AuthorizationResponse;
import com.healthcare.authorization.dto.AuthorizationUploadRequest;
import com.healthcare.authorization.entity.AuthorizationRequest;
import com.healthcare.authorization.repository.AuthorizationRepository;
import com.healthcare.authorization.repository.AuthorizationUiProjection;
import com.healthcare.exception.BadRequestException;
import com.healthcare.exception.NotFoundException;
import com.healthcare.fhir.dto.FhirValidationIssue;
import com.healthcare.fhir.dto.FhirValidationResponse;
import com.healthcare.fhir.service.FhirResourceService;
import com.healthcare.notification.dto.NotificationRequest;
import com.healthcare.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthorizationService {

    private final AuthorizationRepository authorizationRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final AuthorizationFhirService authorizationFhirService;
    private final FhirResourceService fhirResourceService;
    private final ObjectMapper objectMapper;

    public AuthorizationResponse saveDraft(AuthorizationUploadRequest request) {
        AuthorizationRequest entity = authorizationRepository.findTopByRequestNumberOrderByUpdatedAtDesc(request.getRequestNumber())
                .orElseGet(() -> AuthorizationRequest.builder()
                        .requestNumber(request.getRequestNumber())
                        .submittedAt(LocalDateTime.now())
                        .build());

        String previousStatus = entity.getStatus();
        Boolean previousFhirValid = entity.getFhirValid();

        mapDraft(entity, request);
        if (previousStatus == null || previousStatus.isBlank() || "DRAFT".equalsIgnoreCase(previousStatus)) {
            entity.setStatus("DRAFT");
            entity.setFhirValid(false);
        } else {
            entity.setStatus(previousStatus);
            entity.setFhirValid(previousFhirValid != null ? previousFhirValid : false);
        }
        entity.setUpdatedAt(LocalDateTime.now());

        AuthorizationRequest saved = authorizationRepository.save(entity);
        try {
            notificationService.send(NotificationRequest.builder()
                    .event("Provider saved draft")
                    .recipient("provider@healthcare.local")
                    .message("Authorization draft " + saved.getRequestNumber() + " was saved")
                    .build());
            auditLogService.logAction(request.getProviderId(), "Provider saved authorization draft", "authorization_request", saved.getId(), "127.0.0.1");
        } catch (Exception ignored) {
            // Draft persistence is critical; notification/audit side effects must not block save.
        }
        return toResponse(saved);
    }

    public AuthorizationResponse submit(Long id) {
        AuthorizationRequest entity = authorizationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Authorization request not found"));

        Map<String, String> resources = authorizationFhirService.generateSubmissionResources(entity);
        List<String> validationErrors = new ArrayList<>();

        resources.forEach((resourceType, resourceJson) -> {
            FhirValidationResponse response = fhirResourceService.validateResource(resourceJson);
            if (!response.isValid()) {
                String issues = response.getIssues().stream().map(FhirValidationIssue::getMessage).collect(Collectors.joining(", "));
                validationErrors.add(resourceType + ": " + issues);
            }
        });

        if (!validationErrors.isEmpty()) {
            entity.setStatus("INVALID");
            entity.setFhirValid(false);
            entity.setUpdatedAt(LocalDateTime.now());
            authorizationRepository.save(entity);
            throw new BadRequestException("FHIR validation failed: " + String.join(" | ", validationErrors));
        }

        entity.setPatientResourceJson(resources.get("Patient"));
        entity.setCoverageResourceJson(resources.get("Coverage"));
        entity.setPractitionerResourceJson(resources.get("Practitioner"));
        entity.setClaimResourceJson(resources.get("Claim"));
        entity.setDocumentReferenceResourceJson(resources.get("DocumentReference"));
        entity.setStatus("SUBMITTED");
        entity.setFhirValid(true);
        entity.setUpdatedAt(LocalDateTime.now());

        fhirResourceService.createResource("Patient", entity.getPatientResourceJson(), false);
        fhirResourceService.createResource("Coverage", entity.getCoverageResourceJson(), false);
        fhirResourceService.createResource("Practitioner", entity.getPractitionerResourceJson(), false);
        fhirResourceService.createResource("Claim", entity.getClaimResourceJson(), false);
        fhirResourceService.createResource("DocumentReference", entity.getDocumentReferenceResourceJson(), false);

        AuthorizationRequest updated = authorizationRepository.save(entity);
        notificationService.send(NotificationRequest.builder()
                .event("Provider submitted request")
                .recipient("payer@healthcare.local")
                .message("Authorization request " + updated.getRequestNumber() + " is ready for payer review")
                .build());
        auditLogService.logAction(updated.getProviderId(), "Provider submitted authorization", "authorization_request", updated.getId(), "127.0.0.1");
        return toResponse(updated);
    }

    public List<AuthorizationResponse> getAll() {
        Map<String, AuthorizationUiProjection> latestByRequestNumber = new LinkedHashMap<>();

        authorizationRepository.findAllForUi().forEach(request -> latestByRequestNumber.putIfAbsent(request.getRequestNumber(), request));

        return latestByRequestNumber.values().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<AuthorizationResponse> getPayerQueue() {
        Set<String> visibleStatuses = new LinkedHashSet<>(List.of("SUBMITTED", "PENDING", "NEED_MORE_INFO", "INVALID"));
        Map<String, AuthorizationUiProjection> latestByRequestNumber = new LinkedHashMap<>();

        authorizationRepository.findAllForUi().stream()
                .filter(request -> visibleStatuses.contains(normalizeStatus(request.getStatus())))
                .forEach(request -> latestByRequestNumber.putIfAbsent(request.getRequestNumber(), request));

        return latestByRequestNumber.values().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public AuthorizationResponse getById(Long id) {
        return toResponse(authorizationRepository.findForUiById(id)
                .orElseThrow(() -> new NotFoundException("Authorization request not found")));
    }

    public AuthorizationResponse updateStatus(Long id, String status) {
        AuthorizationRequest entity = authorizationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Authorization request not found"));
        entity.setStatus(status);
        entity.setUpdatedAt(LocalDateTime.now());
        AuthorizationRequest updated = authorizationRepository.save(entity);

        String event = switch (status.toUpperCase()) {
            case "APPROVED" -> "Payer approved request";
            case "REJECTED" -> "Payer rejected request";
            default -> "Request status updated";
        };

        notificationService.send(NotificationRequest.builder()
                .event(event)
                .recipient("provider@healthcare.local")
                .message("Authorization request " + updated.getRequestNumber() + " is now " + status)
                .build());
        auditLogService.logAction(entity.getPayerId(), event, "authorization_request", updated.getId(), "127.0.0.1");
        return toResponse(updated);
    }

    public AuthorizationResponse applyDecision(Long id, AuthorizationDecisionRequest request) {
        AuthorizationRequest entity = authorizationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Authorization request not found"));

        String status = request.getStatus().toUpperCase();
        entity.setStatus(status);
        entity.setDecisionReason(request.getReason());
        entity.setUpdatedAt(LocalDateTime.now());

        if ("APPROVED".equals(status)) {
            entity.setClaimResponseResourceJson(authorizationFhirService.generateClaimResponse(entity, request.getReason()));
            fhirResourceService.createResource("ClaimResponse", entity.getClaimResponseResourceJson(), false);
        }

        AuthorizationRequest updated = authorizationRepository.save(entity);
        notificationService.send(NotificationRequest.builder()
                .event("Payer decision recorded")
                .recipient("provider@healthcare.local")
                .message(buildDecisionMessage(updated))
                .build());
        auditLogService.logAction(entity.getPayerId(), "Payer decided authorization", "authorization_request", updated.getId(), "127.0.0.1");
        return toResponse(updated);
    }

    public AuthorizationResponse applyAiReview(Long id, AiReviewResponse reviewResponse) {
        AuthorizationRequest entity = authorizationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Authorization request not found"));
        entity.setAiScore(reviewResponse.getScore());
        entity.setAiMissingJson(writeJson(reviewResponse.getMissing()));
        entity.setAiWarningsJson(writeJson(reviewResponse.getWarnings()));
        entity.setUpdatedAt(LocalDateTime.now());
        return toResponse(authorizationRepository.save(entity));
    }

    private AuthorizationResponse toResponse(AuthorizationRequest entity) {
        return AuthorizationResponse.builder()
                .id(entity.getId())
                .requestNumber(entity.getRequestNumber())
                .providerId(entity.getProviderId())
                .payerId(entity.getPayerId())
                .patientName(entity.getPatientName())
                .patientDob(entity.getPatientDob())
                .patientGender(entity.getPatientGender())
                .patientPhone(entity.getPatientPhone())
                .patientAddress(entity.getPatientAddress())
                .insuranceCompany(entity.getInsuranceCompany())
                .policyNumber(entity.getPolicyNumber())
                .memberId(entity.getMemberId())
                .coverageType(entity.getCoverageType())
                .doctorName(entity.getDoctorName())
                .npiNumber(entity.getNpiNumber())
                .hospital(entity.getHospital())
                .specialty(entity.getSpecialty())
                .diagnosis(entity.getDiagnosis())
                .icd10Code(entity.getIcd10Code())
                .procedureName(entity.getProcedureName())
                .cptCode(entity.getCptCode())
                .reasonForAuthorization(entity.getReasonForAuthorization())
                .mriReport(entity.getMriReport())
                .labReport(entity.getLabReport())
                .prescription(entity.getPrescription())
                .medicalHistory(entity.getMedicalHistory())
                .status(entity.getStatus())
                .fhirValid(entity.getFhirValid())
                .aiScore(entity.getAiScore())
                .aiMissing(prettifyMissing(readJsonList(entity.getAiMissingJson())))
                .aiWarnings(readJsonList(entity.getAiWarningsJson()))
                .decisionReason(entity.getDecisionReason())
                .patientResourceJson(entity.getPatientResourceJson())
                .coverageResourceJson(entity.getCoverageResourceJson())
                .practitionerResourceJson(entity.getPractitionerResourceJson())
                .claimResourceJson(entity.getClaimResourceJson())
                .documentReferenceResourceJson(entity.getDocumentReferenceResourceJson())
                .claimResponseResourceJson(entity.getClaimResponseResourceJson())
                .submittedAt(entity.getSubmittedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private AuthorizationResponse toResponse(AuthorizationUiProjection entity) {
        return AuthorizationResponse.builder()
                .id(entity.getId())
                .requestNumber(entity.getRequestNumber())
                .providerId(entity.getProviderId())
                .payerId(entity.getPayerId())
                .patientName(entity.getPatientName())
                .patientDob(entity.getPatientDob())
                .patientGender(entity.getPatientGender())
                .patientPhone(entity.getPatientPhone())
                .patientAddress(entity.getPatientAddress())
                .insuranceCompany(entity.getInsuranceCompany())
                .policyNumber(entity.getPolicyNumber())
                .memberId(entity.getMemberId())
                .coverageType(entity.getCoverageType())
                .doctorName(entity.getDoctorName())
                .npiNumber(entity.getNpiNumber())
                .hospital(entity.getHospital())
                .specialty(entity.getSpecialty())
                .diagnosis(entity.getDiagnosis())
                .icd10Code(entity.getIcd10Code())
                .procedureName(entity.getProcedureName())
                .cptCode(entity.getCptCode())
                .reasonForAuthorization(entity.getReasonForAuthorization())
                .mriReport(entity.getMriReport())
                .labReport(entity.getLabReport())
                .prescription(entity.getPrescription())
                .medicalHistory(entity.getMedicalHistory())
                .status(entity.getStatus())
                .fhirValid(entity.getFhirValid())
                .aiScore(entity.getAiScore())
                .aiMissing(prettifyMissing(readJsonList(entity.getAiMissingJson())))
                .aiWarnings(readJsonList(entity.getAiWarningsJson()))
                .decisionReason(entity.getDecisionReason())
                .patientResourceJson(null)
                .coverageResourceJson(null)
                .practitionerResourceJson(null)
                .claimResourceJson(null)
                .documentReferenceResourceJson(null)
                .claimResponseResourceJson(null)
                .submittedAt(entity.getSubmittedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private void mapDraft(AuthorizationRequest entity, AuthorizationUploadRequest request) {
        entity.setRequestNumber(request.getRequestNumber());
        entity.setProviderId(request.getProviderId());
        entity.setPayerId(request.getPayerId());
        entity.setPatientName(request.getPatientName() == null ? "" : request.getPatientName());
        entity.setPatientDob(request.getPatientDob());
        entity.setPatientGender(request.getPatientGender());
        entity.setPatientPhone(request.getPatientPhone());
        entity.setPatientAddress(request.getPatientAddress());
        entity.setInsuranceCompany(request.getInsuranceCompany());
        entity.setPolicyNumber(request.getPolicyNumber());
        entity.setMemberId(request.getMemberId());
        entity.setCoverageType(request.getCoverageType());
        entity.setDoctorName(request.getDoctorName());
        entity.setNpiNumber(request.getNpiNumber());
        entity.setHospital(request.getHospital());
        entity.setSpecialty(request.getSpecialty());
        entity.setDiagnosis(request.getDiagnosis());
        entity.setIcd10Code(request.getIcd10Code());
        entity.setProcedureName(request.getProcedureName());
        entity.setCptCode(request.getCptCode());
        entity.setReasonForAuthorization(request.getReasonForAuthorization());
        entity.setMriReport(request.getMriReport());
        entity.setLabReport(request.getLabReport());
        entity.setPrescription(request.getPrescription());
        entity.setMedicalHistory(request.getMedicalHistory());
        entity.setPayload(request.getPayload());
    }

    private String buildDecisionMessage(AuthorizationRequest request) {
        if (request.getDecisionReason() == null || request.getDecisionReason().isBlank()) {
            return "Authorization request " + request.getRequestNumber() + " is now " + request.getStatus();
        }
        return "Authorization request " + request.getRequestNumber() + " is now " + request.getStatus() + ": " + request.getDecisionReason();
    }

    private String writeJson(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values == null ? List.of() : values);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String normalizeStatus(String status) {
        return status == null ? "" : status.trim().toUpperCase();
    }

    private List<String> readJsonList(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private List<String> prettifyMissing(List<String> raw) {
        if (raw == null || raw.isEmpty()) {
            return List.of();
        }
        List<String> out = new ArrayList<>();
        for (String item : raw) {
            if (item == null) continue;
            String normalized = item.trim();
            String lower = normalized.toLowerCase();
            // Normalize common patterns where AI returns free-text mentioning fields
            if (lower.contains("patient") && !lower.contains("patient name") && !lower.contains("patientname")) {
                out.add("Patient name is missing or incorrect.");
                continue;
            }
            if (lower.contains("doctor") && !lower.contains("doctor name") && !lower.contains("doctorname") && !lower.contains("dr")) {
                out.add("Doctor name is missing or incorrect.");
                continue;
            }
            switch (lower) {
                case "patientname", "patient_name", "patient name":
                    out.add("Patient name is missing or incorrect.");
                    break;
                case "doctorname", "doctor_name", "doctor name", "drname", "dr name":
                    out.add("Doctor name is missing or incorrect.");
                    break;
                case "providername", "provider_name", "provider name":
                    out.add("Provider name is missing or incorrect.");
                    break;
                default:
                    // If the item looks like a camelCase field (e.g., patientName), convert to readable
                    if (normalized.matches("[a-zA-Z]+[A-Z][a-zA-Z]*")) {
                        String pretty = normalized.replaceAll("([a-z])([A-Z])", "$1 $2");
                        out.add(pretty.substring(0, 1).toUpperCase() + pretty.substring(1) + " is missing or incorrect.");
                    } else {
                        out.add(normalized);
                    }
            }
        }
        return out;
    }
}
