package com.healthconn.healthcare_connector.fhir;

import com.healthconn.healthcare_connector.authentication.dto.AuthModels.AuthResponse;
import com.healthconn.healthcare_connector.authentication.dto.AuthModels.LoginRequest;
import com.healthconn.healthcare_connector.authentication.dto.AuthModels.RegisterRequest;
import com.healthconn.healthcare_connector.authentication.entity.Role;
import com.healthconn.healthcare_connector.dashboard.dto.DashboardStatsDto;
import com.healthconn.healthcare_connector.notification.dto.NotificationDto;
import com.healthconn.healthcare_connector.payer.dto.ReviewRequestDto;
import com.healthconn.healthcare_connector.provider.dto.AiReviewRequestDto;
import com.healthconn.healthcare_connector.provider.dto.AiReviewResponseDto;
import com.healthconn.healthcare_connector.provider.dto.AuthRequestResponseDto;
import com.healthconn.healthcare_connector.provider.dto.SubmitRequestDto;
import com.healthconn.healthcare_connector.provider.dto.SuggestRequestDto;
import com.healthconn.healthcare_connector.provider.entity.Priority;
import com.healthconn.healthcare_connector.provider.entity.RequestStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Maps between FHIR R4 JSON maps and existing business DTOs.
 */
@Component
@RequiredArgsConstructor
public class FhirMapper {

    private final FhirValidator fhirValidator;

    public RegisterRequest toRegisterRequest(Map<String, Object> practitioner) {
        fhirValidator.requireResourceType(practitioner, "Practitioner");
        RegisterRequest request = new RegisterRequest();
        request.setEmail(firstIdentifierValue(practitioner));
        request.setFullName(officialName(practitioner));
        request.setPassword(extensionValue(practitioner, "password"));
        String roleCode = extensionValue(practitioner, "role");
        request.setRole(Role.valueOf(roleCode != null ? roleCode : "PROVIDER"));
        return request;
    }

    public LoginRequest toLoginRequest(Map<String, Object> parameters) {
        fhirValidator.requireResourceType(parameters, "Parameters");
        fhirValidator.requireParameter(parameters, "email");
        fhirValidator.requireParameter(parameters, "password");
        LoginRequest request = new LoginRequest();
        request.setEmail(String.valueOf(fhirValidator.findParameterValue(parameters, "email")));
        request.setPassword(String.valueOf(fhirValidator.findParameterValue(parameters, "password")));
        return request;
    }

    public Map<String, Object> toAuthParameters(AuthResponse auth) {
        Map<String, Object> resource = new LinkedHashMap<String, Object>();
        resource.put("resourceType", "Parameters");
        List<Map<String, Object>> params = new ArrayList<Map<String, Object>>();
        params.add(stringParam("token", auth.getToken()));
        params.add(stringParam("userId", String.valueOf(auth.getUserId())));
        params.add(stringParam("email", auth.getEmail()));
        params.add(stringParam("fullName", auth.getFullName()));
        params.add(stringParam("role", auth.getRole()));
        resource.put("parameter", params);
        return resource;
    }

    public Map<String, Object> toPractitioner(AuthResponse auth) {
        Map<String, Object> resource = new LinkedHashMap<String, Object>();
        resource.put("resourceType", "Practitioner");
        resource.put("id", "PRAC-" + auth.getUserId());
        resource.put("meta", meta("1"));
        resource.put("active", true);
        resource.put("identifier", singletonIdentifier(
                "https://healthconn.example.com/users", auth.getEmail()));
        resource.put("name", singletonOfficialName(auth.getFullName()));
        List<Map<String, Object>> extensions = new ArrayList<Map<String, Object>>();
        extensions.add(stringExtension("role", auth.getRole()));
        resource.put("extension", extensions);
        return resource;
    }

    public SubmitRequestDto toSubmitRequest(Map<String, Object> serviceRequest) {
        fhirValidator.requireResourceType(serviceRequest, "ServiceRequest");
        SubmitRequestDto dto = new SubmitRequestDto();
        dto.setPatientId(referenceId(serviceRequest.get("subject")));
        dto.setPatientName(extensionValue(serviceRequest, "patientName"));
        dto.setInsuranceId(extensionValue(serviceRequest, "insuranceId"));
        dto.setProcedureCode(firstCodingCode(serviceRequest.get("code")));
        dto.setDiagnosisCode(firstReasonCode(serviceRequest));
        dto.setTreatmentDescription(firstNoteText(serviceRequest));
        Map<String, Object> period = asMap(serviceRequest.get("occurrencePeriod"));
        if (period != null) {
            if (period.get("start") != null) {
                dto.setAdmissionDate(LocalDate.parse(String.valueOf(period.get("start"))));
            }
            if (period.get("end") != null) {
                dto.setExpectedDischargeDate(LocalDate.parse(String.valueOf(period.get("end"))));
            }
        }
        dto.setPriority(toPriority(String.valueOf(serviceRequest.get("priority"))));
        return dto;
    }

    public Map<String, Object> toServiceRequest(AuthRequestResponseDto dto) {
        Map<String, Object> resource = new LinkedHashMap<String, Object>();
        resource.put("resourceType", "ServiceRequest");
        resource.put("id", String.valueOf(dto.getId()));
        resource.put("meta", meta("1"));
        resource.put("status", toFhirStatus(dto.getStatus()));
        resource.put("intent", "order");
        resource.put("priority", toFhirPriority(dto.getPriority()));
        resource.put("subject", reference("Patient", dto.getPatientId(), dto.getPatientName()));
        resource.put("requester", reference("Practitioner", String.valueOf(dto.getProviderId()), dto.getProviderName()));
        resource.put("code", coding("http://www.ama-assn.org/go/cpt", dto.getProcedureCode(), "Procedure"));
        resource.put("reasonCode", singletonList(
                coding("http://hl7.org/fhir/sid/icd-10-cm", dto.getDiagnosisCode(), "Diagnosis")));
        if (dto.getTreatmentDescription() != null) {
            resource.put("note", singletonList(note(dto.getTreatmentDescription())));
        }
        Map<String, Object> period = new LinkedHashMap<String, Object>();
        if (dto.getAdmissionDate() != null) {
            period.put("start", dto.getAdmissionDate().toString());
        }
        if (dto.getExpectedDischargeDate() != null) {
            period.put("end", dto.getExpectedDischargeDate().toString());
        }
        resource.put("occurrencePeriod", period);

        List<Map<String, Object>> extensions = new ArrayList<Map<String, Object>>();
        extensions.add(stringExtension("patientName", dto.getPatientName()));
        extensions.add(stringExtension("insuranceId", dto.getInsuranceId()));
        if (dto.getRejectionReason() != null) {
            extensions.add(stringExtension("rejectionReason", dto.getRejectionReason()));
        }
        if (dto.getReviewNotes() != null) {
            extensions.add(stringExtension("reviewNotes", dto.getReviewNotes()));
        }
        resource.put("extension", extensions);
        return resource;
    }

    public ReviewRequestDto toReviewRequest(Map<String, Object> claimResponse) {
        fhirValidator.requireResourceType(claimResponse, "ClaimResponse");
        ReviewRequestDto dto = new ReviewRequestDto();
        String disposition = String.valueOf(claimResponse.get("disposition"));
        if ("Approved".equalsIgnoreCase(disposition) || "complete".equalsIgnoreCase(String.valueOf(claimResponse.get("outcome")))) {
            dto.setDecision(RequestStatus.APPROVED);
        } else {
            dto.setDecision(RequestStatus.REJECTED);
        }
        dto.setReviewNotes(firstProcessNote(claimResponse));
        dto.setRejectionReason(extensionValue(claimResponse, "rejectionReason"));
        return dto;
    }

    public Map<String, Object> toClaimResponse(AuthRequestResponseDto dto) {
        Map<String, Object> resource = new LinkedHashMap<String, Object>();
        resource.put("resourceType", "ClaimResponse");
        resource.put("id", "CR-" + dto.getId());
        resource.put("meta", meta("1"));
        resource.put("status", "active");
        resource.put("outcome", dto.getStatus() == RequestStatus.APPROVED ? "complete" : "error");
        resource.put("disposition", dto.getStatus() == RequestStatus.APPROVED ? "Approved" : "Rejected");
        resource.put("patient", reference("Patient", dto.getPatientId(), dto.getPatientName()));
        resource.put("request", reference("ServiceRequest", String.valueOf(dto.getId()), null));
        if (dto.getReviewNotes() != null) {
            resource.put("processNote", singletonList(processNote(dto.getReviewNotes())));
        }
        List<Map<String, Object>> extensions = new ArrayList<Map<String, Object>>();
        if (dto.getRejectionReason() != null) {
            extensions.add(stringExtension("rejectionReason", dto.getRejectionReason()));
        }
        resource.put("extension", extensions);
        return resource;
    }

    public SuggestRequestDto toSuggestRequest(Map<String, Object> parameters) {
        fhirValidator.requireResourceType(parameters, "Parameters");
        SuggestRequestDto dto = new SuggestRequestDto();
        dto.setFieldName(asString(fhirValidator.findParameterValue(parameters, "fieldName")));
        dto.setFieldValue(asString(fhirValidator.findParameterValue(parameters, "fieldValue")));
        dto.setDiagnosisCode(asString(fhirValidator.findParameterValue(parameters, "diagnosisCode")));
        dto.setProcedureCode(asString(fhirValidator.findParameterValue(parameters, "procedureCode")));
        dto.setTreatmentDescription(asString(fhirValidator.findParameterValue(parameters, "treatmentDescription")));
        return dto;
    }

    public Map<String, Object> toSuggestionParameters(String suggestion) {
        Map<String, Object> resource = new LinkedHashMap<String, Object>();
        resource.put("resourceType", "Parameters");
        resource.put("parameter", singletonList(stringParam("suggestion", suggestion)));
        return resource;
    }

    public AiReviewRequestDto toAiReviewRequest(Map<String, Object> parameters) {
        fhirValidator.requireResourceType(parameters, "Parameters");
        AiReviewRequestDto dto = new AiReviewRequestDto();
        dto.setPatientName(asString(fhirValidator.findParameterValue(parameters, "patientName")));
        dto.setPatientAge(asString(fhirValidator.findParameterValue(parameters, "patientAge")));
        dto.setGender(asString(fhirValidator.findParameterValue(parameters, "gender")));
        dto.setPatientId(asString(fhirValidator.findParameterValue(parameters, "patientId")));
        dto.setInsuranceId(asString(fhirValidator.findParameterValue(parameters, "insuranceId")));
        dto.setDiagnosis(asString(fhirValidator.findParameterValue(parameters, "diagnosis")));
        dto.setDiagnosisCode(asString(fhirValidator.findParameterValue(parameters, "diagnosisCode")));
        dto.setTreatment(asString(fhirValidator.findParameterValue(parameters, "treatment")));
        dto.setProcedureCode(asString(fhirValidator.findParameterValue(parameters, "procedureCode")));
        dto.setTreatmentDescription(asString(fhirValidator.findParameterValue(parameters, "treatmentDescription")));
        dto.setTreatmentDate(asString(fhirValidator.findParameterValue(parameters, "treatmentDate")));
        dto.setAdmissionDate(asString(fhirValidator.findParameterValue(parameters, "admissionDate")));
        dto.setExpectedDischargeDate(asString(fhirValidator.findParameterValue(parameters, "expectedDischargeDate")));
        dto.setPriority(asString(fhirValidator.findParameterValue(parameters, "priority")));
        dto.setClinicalNotes(asString(fhirValidator.findParameterValue(parameters, "clinicalNotes")));
        return dto;
    }

    public Map<String, Object> toAiReviewParameters(AiReviewResponseDto review) {
        Map<String, Object> resource = new LinkedHashMap<String, Object>();
        resource.put("resourceType", "Parameters");
        List<Map<String, Object>> params = new ArrayList<Map<String, Object>>();
        params.add(stringParam("score", String.valueOf(review.getScore())));
        params.add(stringParam("ready", review.isReady() ? "YES" : "NO"));

        // Field-wise suggestions with expected format examples
        if (review.getFieldSuggestions() != null) {
            for (com.healthconn.healthcare_connector.provider.dto.FieldGuideDto guide
                    : review.getFieldSuggestions()) {
                Map<String, Object> part = new LinkedHashMap<String, Object>();
                part.put("name", "fieldSuggestion");
                List<Map<String, Object>> parts = new ArrayList<Map<String, Object>>();
                parts.add(stringParam("type", guide.getType() == null ? "SUGGESTION" : guide.getType()));
                parts.add(stringParam("field", guide.getField() == null ? "" : guide.getField()));
                parts.add(stringParam("issue", guide.getIssue() == null ? "" : guide.getIssue()));
                parts.add(stringParam("expected", guide.getExpected() == null ? "" : guide.getExpected()));
                part.put("part", parts);
                params.add(part);
            }
        }

        resource.put("parameter", params);
        return resource;
    }

    public Map<String, Object> toCommunication(NotificationDto dto) {
        Map<String, Object> resource = new LinkedHashMap<String, Object>();
        resource.put("resourceType", "Communication");
        resource.put("id", String.valueOf(dto.getId()));
        resource.put("meta", meta("1"));
        resource.put("status", dto.isRead() ? "completed" : "in-progress");
        resource.put("priority", "routine");
        resource.put("payload", singletonList(contentString(dto.getTitle() + ": " + dto.getMessage())));
        if (dto.getRequestId() != null) {
            resource.put("about", singletonList(
                    reference("ServiceRequest", String.valueOf(dto.getRequestId()), null)));
        }
        List<Map<String, Object>> extensions = new ArrayList<Map<String, Object>>();
        extensions.add(stringExtension("title", dto.getTitle()));
        extensions.add(stringExtension("type", dto.getType() != null ? dto.getType().name() : null));
        extensions.add(booleanExtension("isRead", dto.isRead()));
        resource.put("extension", extensions);
        if (dto.getCreatedAt() != null) {
            resource.put("sent", dto.getCreatedAt().atOffset(ZoneOffset.UTC).toString());
        }
        return resource;
    }

    public Map<String, Object> toMeasureReport(DashboardStatsDto stats) {
        Map<String, Object> resource = new LinkedHashMap<String, Object>();
        resource.put("resourceType", "MeasureReport");
        resource.put("id", "dashboard-stats");
        resource.put("meta", meta("1"));
        resource.put("status", "complete");
        resource.put("type", "summary");
        resource.put("date", OffsetDateTime.now(ZoneOffset.UTC).toString());

        List<Map<String, Object>> group = new ArrayList<Map<String, Object>>();
        group.add(measureGroup("totalRequests", stats.getTotalRequests()));
        group.add(measureGroup("submitted", stats.getSubmitted()));
        group.add(measureGroup("underReview", stats.getUnderReview()));
        group.add(measureGroup("approved", stats.getApproved()));
        group.add(measureGroup("rejected", stats.getRejected()));
        resource.put("group", group);

        List<Map<String, Object>> extensions = new ArrayList<Map<String, Object>>();
        extensions.add(objectExtension("statusDistribution", stats.getStatusDistribution()));
        extensions.add(objectExtension("monthlyByPriority", stats.getMonthlyByPriority()));
        extensions.add(objectExtension("providerSummary", stats.getProviderSummary()));
        extensions.add(objectExtension("payerSummary", stats.getPayerSummary()));
        resource.put("extension", extensions);
        return resource;
    }

    public Map<String, Object> toBundle(String type, List<Map<String, Object>> entries) {
        Map<String, Object> bundle = new LinkedHashMap<String, Object>();
        bundle.put("resourceType", "Bundle");
        bundle.put("type", type);
        bundle.put("total", entries.size());
        List<Map<String, Object>> entryList = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> resource : entries) {
            Map<String, Object> entry = new LinkedHashMap<String, Object>();
            Object id = resource.get("id");
            Object resourceType = resource.get("resourceType");
            if (id != null && resourceType != null) {
                entry.put("fullUrl", resourceType + "/" + id);
            }
            entry.put("resource", resource);
            entryList.add(entry);
        }
        bundle.put("entry", entryList);
        return bundle;
    }

    public Map<String, Object> toCapabilityStatement() {
        Map<String, Object> resource = new LinkedHashMap<String, Object>();
        resource.put("resourceType", "CapabilityStatement");
        resource.put("status", "active");
        resource.put("date", OffsetDateTime.now(ZoneOffset.UTC).toString());
        resource.put("kind", "instance");
        resource.put("fhirVersion", "4.0.1");
        resource.put("format", java.util.Arrays.asList("application/fhir+json", "application/json"));
        resource.put("description", "Healthcare Connector FHIR R4 APIs");
        return resource;
    }

    public Long extractServiceRequestId(Map<String, Object> claimResponse) {
        Map<String, Object> request = asMap(claimResponse.get("request"));
        if (request == null || request.get("reference") == null) {
            throw new IllegalArgumentException("ClaimResponse.request.reference is required");
        }
        String reference = String.valueOf(request.get("reference"));
        String id = reference.contains("/") ? reference.substring(reference.lastIndexOf('/') + 1) : reference;
        return Long.valueOf(id);
    }

    private Map<String, Object> meta(String versionId) {
        Map<String, Object> meta = new LinkedHashMap<String, Object>();
        meta.put("versionId", versionId);
        meta.put("lastUpdated", OffsetDateTime.now(ZoneOffset.UTC).toString());
        return meta;
    }

    private Map<String, Object> stringParam(String name, String value) {
        Map<String, Object> param = new LinkedHashMap<String, Object>();
        param.put("name", name);
        param.put("valueString", value);
        return param;
    }

    private Map<String, Object> stringExtension(String urlSuffix, String value) {
        Map<String, Object> extension = new LinkedHashMap<String, Object>();
        extension.put("url", "https://healthconn.example.com/fhir/StructureDefinition/" + urlSuffix);
        extension.put("valueString", value);
        return extension;
    }

    private Map<String, Object> booleanExtension(String urlSuffix, boolean value) {
        Map<String, Object> extension = new LinkedHashMap<String, Object>();
        extension.put("url", "https://healthconn.example.com/fhir/StructureDefinition/" + urlSuffix);
        extension.put("valueBoolean", value);
        return extension;
    }

    private Map<String, Object> objectExtension(String urlSuffix, Object value) {
        Map<String, Object> extension = new LinkedHashMap<String, Object>();
        extension.put("url", "https://healthconn.example.com/fhir/StructureDefinition/" + urlSuffix);
        extension.put("value", value);
        return extension;
    }

    private Map<String, Object> reference(String type, String id, String display) {
        Map<String, Object> reference = new LinkedHashMap<String, Object>();
        reference.put("reference", type + "/" + id);
        if (display != null) {
            reference.put("display", display);
        }
        return reference;
    }

    private Map<String, Object> coding(String system, String code, String display) {
        Map<String, Object> coding = new LinkedHashMap<String, Object>();
        Map<String, Object> item = new LinkedHashMap<String, Object>();
        item.put("system", system);
        item.put("code", code);
        item.put("display", display);
        coding.put("coding", singletonList(item));
        return coding;
    }

    private Map<String, Object> note(String text) {
        Map<String, Object> note = new LinkedHashMap<String, Object>();
        note.put("text", text);
        return note;
    }

    private Map<String, Object> processNote(String text) {
        Map<String, Object> note = new LinkedHashMap<String, Object>();
        note.put("text", text);
        return note;
    }

    private Map<String, Object> contentString(String text) {
        Map<String, Object> payload = new LinkedHashMap<String, Object>();
        payload.put("contentString", text);
        return payload;
    }

    private Map<String, Object> measureGroup(String code, long value) {
        Map<String, Object> group = new LinkedHashMap<String, Object>();
        Map<String, Object> codeMap = new LinkedHashMap<String, Object>();
        codeMap.put("text", code);
        group.put("code", codeMap);
        Map<String, Object> measureScore = new LinkedHashMap<String, Object>();
        measureScore.put("value", value);
        group.put("measureScore", measureScore);
        return group;
    }

    private List<Map<String, Object>> singletonIdentifier(String system, String value) {
        Map<String, Object> identifier = new LinkedHashMap<String, Object>();
        identifier.put("system", system);
        identifier.put("value", value);
        return singletonList(identifier);
    }

    private List<Map<String, Object>> singletonOfficialName(String fullName) {
        Map<String, Object> name = new LinkedHashMap<String, Object>();
        name.put("use", "official");
        name.put("text", fullName);
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) {
            name.put("family", parts[0]);
            name.put("given", singletonList(parts[0]));
        } else {
            name.put("family", parts[parts.length - 1]);
            List<String> given = new ArrayList<String>();
            for (int i = 0; i < parts.length - 1; i++) {
                given.add(parts[i]);
            }
            name.put("given", given);
        }
        return singletonList(name);
    }

    @SuppressWarnings("unchecked")
    private String firstIdentifierValue(Map<String, Object> resource) {
        Object identifiers = resource.get("identifier");
        if (identifiers instanceof List && !((List<?>) identifiers).isEmpty()) {
            Object first = ((List<?>) identifiers).get(0);
            if (first instanceof Map) {
                return asString(((Map<String, Object>) first).get("value"));
            }
        }
        return extensionValue(resource, "email");
    }

    @SuppressWarnings("unchecked")
    private String officialName(Map<String, Object> resource) {
        Object names = resource.get("name");
        if (names instanceof List && !((List<?>) names).isEmpty()) {
            Object first = ((List<?>) names).get(0);
            if (first instanceof Map) {
                Map<String, Object> name = (Map<String, Object>) first;
                if (name.get("text") != null) {
                    return asString(name.get("text"));
                }
                String family = asString(name.get("family"));
                Object given = name.get("given");
                if (given instanceof List && !((List<?>) given).isEmpty()) {
                    return ((List<?>) given).get(0) + " " + family;
                }
                return family;
            }
        }
        return "Unknown";
    }

    @SuppressWarnings("unchecked")
    private String extensionValue(Map<String, Object> resource, String suffix) {
        Object extensions = resource.get("extension");
        if (!(extensions instanceof List)) {
            return null;
        }
        String expectedUrl = "https://healthconn.example.com/fhir/StructureDefinition/" + suffix;
        for (Object item : (List<?>) extensions) {
            if (!(item instanceof Map)) {
                continue;
            }
            Map<String, Object> extension = (Map<String, Object>) item;
            if (expectedUrl.equals(extension.get("url"))) {
                if (extension.get("valueString") != null) {
                    return asString(extension.get("valueString"));
                }
                return asString(extension.get("value"));
            }
        }
        return null;
    }

    private String referenceId(Object subject) {
        Map<String, Object> map = asMap(subject);
        if (map == null || map.get("reference") == null) {
            throw new IllegalArgumentException("subject.reference is required");
        }
        String reference = String.valueOf(map.get("reference"));
        return reference.contains("/") ? reference.substring(reference.lastIndexOf('/') + 1) : reference;
    }

    @SuppressWarnings("unchecked")
    private String firstCodingCode(Object codeObj) {
        Map<String, Object> code = asMap(codeObj);
        if (code == null) {
            return null;
        }
        Object coding = code.get("coding");
        if (coding instanceof List && !((List<?>) coding).isEmpty()) {
            Object first = ((List<?>) coding).get(0);
            if (first instanceof Map) {
                return asString(((Map<String, Object>) first).get("code"));
            }
        }
        return asString(code.get("text"));
    }

    @SuppressWarnings("unchecked")
    private String firstReasonCode(Map<String, Object> serviceRequest) {
        Object reasonCode = serviceRequest.get("reasonCode");
        if (reasonCode instanceof List && !((List<?>) reasonCode).isEmpty()) {
            return firstCodingCode(((List<?>) reasonCode).get(0));
        }
        return extensionValue(serviceRequest, "diagnosisCode");
    }

    @SuppressWarnings("unchecked")
    private String firstNoteText(Map<String, Object> serviceRequest) {
        Object notes = serviceRequest.get("note");
        if (notes instanceof List && !((List<?>) notes).isEmpty()) {
            Object first = ((List<?>) notes).get(0);
            if (first instanceof Map) {
                return asString(((Map<String, Object>) first).get("text"));
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private String firstProcessNote(Map<String, Object> claimResponse) {
        Object notes = claimResponse.get("processNote");
        if (notes instanceof List && !((List<?>) notes).isEmpty()) {
            Object first = ((List<?>) notes).get(0);
            if (first instanceof Map) {
                return asString(((Map<String, Object>) first).get("text"));
            }
        }
        return null;
    }

    private Priority toPriority(String fhirPriority) {
        if (fhirPriority == null || "null".equals(fhirPriority)) {
            return Priority.NORMAL;
        }
        if ("urgent".equalsIgnoreCase(fhirPriority)) {
            return Priority.URGENT;
        }
        if ("asap".equalsIgnoreCase(fhirPriority) || "stat".equalsIgnoreCase(fhirPriority)) {
            return Priority.EMERGENCY;
        }
        return Priority.NORMAL;
    }

    private String toFhirPriority(Priority priority) {
        if (priority == Priority.URGENT) {
            return "urgent";
        }
        if (priority == Priority.EMERGENCY) {
            return "asap";
        }
        return "routine";
    }

    private String toFhirStatus(RequestStatus status) {
        if (status == null) {
            return "unknown";
        }
        switch (status) {
            case DRAFT:
                return "draft";
            case SUBMITTED:
            case UNDER_REVIEW:
                return "active";
            case APPROVED:
                return "completed";
            case REJECTED:
                return "revoked";
            default:
                return "unknown";
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object value) {
        if (value instanceof Map) {
            return (Map<String, Object>) value;
        }
        return null;
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private <T> List<T> singletonList(T value) {
        List<T> list = new ArrayList<T>();
        list.add(value);
        return list;
    }
}
