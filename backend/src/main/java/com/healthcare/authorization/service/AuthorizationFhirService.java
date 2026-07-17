package com.healthcare.authorization.service;

import java.nio.charset.StandardCharsets;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.StringJoiner;

import org.hl7.fhir.r4.model.Address;
import org.hl7.fhir.r4.model.Attachment;
import org.hl7.fhir.r4.model.Claim;
import org.hl7.fhir.r4.model.ClaimResponse;
import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.Coding;
import org.hl7.fhir.r4.model.Coverage;
import org.hl7.fhir.r4.model.DateTimeType;
import org.hl7.fhir.r4.model.DocumentReference;
import org.hl7.fhir.r4.model.Enumerations;
import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.Identifier;
import org.hl7.fhir.r4.model.Patient;
import org.hl7.fhir.r4.model.Practitioner;
import org.hl7.fhir.r4.model.Reference;
import org.hl7.fhir.r4.model.StringType;
import org.springframework.stereotype.Service;

import com.healthcare.authorization.entity.AuthorizationRequest;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;

@Service
public class AuthorizationFhirService {

    private final FhirContext ctx = FhirContext.forR4();
    private final IParser parser = ctx.newJsonParser().setPrettyPrint(true);

    public Map<String, String> generateSubmissionResources(AuthorizationRequest request) {
        String patientId = safeId(request.getRequestNumber() + "-patient");
        String coverageId = safeId(request.getRequestNumber() + "-coverage");
        String practitionerId = safeId(request.getRequestNumber() + "-practitioner");
        String claimId = safeId(request.getRequestNumber() + "-claim");
        String documentReferenceId = safeId(request.getRequestNumber() + "-document-reference");

        Patient patient = buildPatient(request, patientId);
        Coverage coverage = buildCoverage(request, patientId, coverageId);
        Practitioner practitioner = buildPractitioner(request, practitionerId);
        Claim claim = buildClaim(request, patientId, practitionerId, coverageId, claimId);
        DocumentReference documentReference = buildDocumentReference(request, patientId, practitionerId, documentReferenceId);

        Map<String, String> resources = new LinkedHashMap<>();
        resources.put("Patient", parser.encodeResourceToString(patient));
        resources.put("Coverage", parser.encodeResourceToString(coverage));
        resources.put("Practitioner", parser.encodeResourceToString(practitioner));
        resources.put("Claim", parser.encodeResourceToString(claim));
        resources.put("DocumentReference", parser.encodeResourceToString(documentReference));
        return resources;
    }

    public String generateClaimResponse(AuthorizationRequest request, String reason) {
        ClaimResponse claimResponse = new ClaimResponse();
        claimResponse.setId(safeId(request.getRequestNumber() + "-claim-response"));
        claimResponse.setStatus(ClaimResponse.ClaimResponseStatus.ACTIVE);
        claimResponse.getUseElement().setValueAsString("claim");
        claimResponse.setCreatedElement(new DateTimeType(DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(request.getUpdatedAt().atOffset(ZoneOffset.UTC))));
        claimResponse.setPatient(new Reference("Patient/" + safeId(request.getRequestNumber() + "-patient")));
        claimResponse.setRequest(new Reference("Claim/" + safeId(request.getRequestNumber() + "-claim")));
        claimResponse.setOutcome(ClaimResponse.RemittanceOutcome.COMPLETE);
        claimResponse.setDisposition((reason == null || reason.isBlank()) ? "Request approved" : reason);
        claimResponse.getType().setText("professional");

        ClaimResponse.ItemComponent item = new ClaimResponse.ItemComponent();
        item.setItemSequence(1);
        claimResponse.addItem(item);

        return parser.encodeResourceToString(claimResponse);
    }

    private Patient buildPatient(AuthorizationRequest request, String patientId) {
        Patient patient = new Patient();
        patient.setId(patientId);
        patient.addIdentifier(new Identifier().setSystem("http://healthcare.local/authorizations").setValue(request.getRequestNumber()));
        patient.addName(splitName(request.getPatientName()));
        if (hasText(request.getPatientGender())) {
            try {
                patient.setGender(Enumerations.AdministrativeGender.fromCode(request.getPatientGender().toLowerCase()));
            } catch (Exception ignored) {
                patient.getGenderElement().setValueAsString(request.getPatientGender());
            }
        }
        if (hasText(request.getPatientDob())) {
            patient.setBirthDateElement(new org.hl7.fhir.r4.model.DateType(request.getPatientDob()));
        }
        if (hasText(request.getPatientPhone())) {
            patient.addTelecom().setSystem(org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem.PHONE).setValue(request.getPatientPhone());
        }
        if (hasText(request.getPatientAddress())) {
            patient.addAddress(new Address().setText(request.getPatientAddress()));
        }
        return patient;
    }

    private Coverage buildCoverage(AuthorizationRequest request, String patientId, String coverageId) {
        Coverage coverage = new Coverage();
        coverage.setId(coverageId);
        coverage.setStatus(Coverage.CoverageStatus.ACTIVE);
        coverage.setBeneficiary(new Reference("Patient/" + patientId));
        coverage.setSubscriberId(request.getMemberId());
        coverage.setPayor(java.util.List.of(new Reference().setDisplay(defaultText(request.getInsuranceCompany(), "Unknown Insurance"))));
        coverage.getType().setText(defaultText(request.getCoverageType(), "medical"));
        if (hasText(request.getPolicyNumber())) {
            coverage.addIdentifier().setSystem("http://healthcare.local/policies").setValue(request.getPolicyNumber());
        }
        return coverage;
    }

    private Practitioner buildPractitioner(AuthorizationRequest request, String practitionerId) {
        Practitioner practitioner = new Practitioner();
        practitioner.setId(practitionerId);
        practitioner.setActive(true);
        practitioner.addName(splitName(request.getDoctorName()));
        if (hasText(request.getNpiNumber())) {
            practitioner.addIdentifier(new Identifier().setSystem("http://hl7.org/fhir/sid/us-npi").setValue(request.getNpiNumber()));
        }
        if (hasText(request.getSpecialty())) {
            Practitioner.PractitionerQualificationComponent qualification = new Practitioner.PractitionerQualificationComponent();
            qualification.setCode(new CodeableConcept().setText(request.getSpecialty()));
            practitioner.addQualification(qualification);
        }
        return practitioner;
    }

    private Claim buildClaim(AuthorizationRequest request, String patientId, String practitionerId, String coverageId, String claimId) {
        Claim claim = new Claim();
        claim.setId(claimId);
        claim.setStatus(Claim.ClaimStatus.ACTIVE);
        claim.setUse(Claim.Use.PREAUTHORIZATION);
        claim.getType().setText("professional");
        claim.setPatient(new Reference("Patient/" + patientId));
        claim.setCreatedElement(new DateTimeType(DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(request.getUpdatedAt().atOffset(ZoneOffset.UTC))));
        claim.setProvider(new Reference("Practitioner/" + practitionerId));
        claim.getPriority().setText("normal");
        claim.addInsurance().setSequence(1).setFocal(true).setCoverage(new Reference("Coverage/" + coverageId));

        Claim.DiagnosisComponent diagnosis = new Claim.DiagnosisComponent();
        diagnosis.setSequence(1);
        diagnosis.setDiagnosis(new CodeableConcept().setText(defaultText(request.getDiagnosis(), "Diagnosis pending"))
                .addCoding(new Coding().setCode(defaultText(request.getIcd10Code(), "UNKNOWN")).setSystem("http://hl7.org/fhir/sid/icd-10-cm")));
        claim.addDiagnosis(diagnosis);

        Claim.ItemComponent item = new Claim.ItemComponent();
        item.setSequence(1);
        item.setProductOrService(new CodeableConcept().setText(defaultText(request.getProcedureName(), "Procedure pending"))
                .addCoding(new Coding().setCode(defaultText(request.getCptCode(), "00000")).setSystem("http://www.ama-assn.org/go/cpt")));
        claim.addItem(item);

        Claim.SupportingInformationComponent supportingInformation = new Claim.SupportingInformationComponent();
        supportingInformation.setSequence(1);
        supportingInformation.setCategory(new CodeableConcept().setText("reason"));
        supportingInformation.setValue(new StringType(defaultText(request.getReasonForAuthorization(), "Reason not provided")));
        claim.addSupportingInfo(supportingInformation);
        return claim;
    }

    private DocumentReference buildDocumentReference(AuthorizationRequest request, String patientId, String practitionerId, String documentReferenceId) {
        DocumentReference documentReference = new DocumentReference();
        documentReference.setId(documentReferenceId);
        documentReference.setStatus(Enumerations.DocumentReferenceStatus.CURRENT);
        documentReference.getType().setText("Prior authorization attachments");
        documentReference.setSubject(new Reference("Patient/" + patientId));
        documentReference.addAuthor(new Reference("Practitioner/" + practitionerId));
        documentReference.setDescription(attachmentSummary(request));

        Attachment attachment = new Attachment();
        attachment.setContentType("text/plain");
        attachment.setTitle("Prior authorization supporting documents");
        attachment.setData(Base64.getEncoder().encode(attachmentSummary(request).getBytes(StandardCharsets.UTF_8)));
        documentReference.addContent().setAttachment(attachment);
        return documentReference;
    }

    private HumanName splitName(String fullName) {
        HumanName name = new HumanName();
        if (!hasText(fullName)) {
            name.setFamily("Unknown");
            name.addGiven("Unknown");
            return name;
        }
        String[] parts = fullName.trim().split("\\s+");
        name.setFamily(parts.length > 1 ? parts[parts.length - 1] : parts[0]);
        for (int i = 0; i < Math.max(1, parts.length - 1); i++) {
            name.addGiven(parts[i]);
        }
        return name;
    }

    private String attachmentSummary(AuthorizationRequest request) {
        StringJoiner joiner = new StringJoiner("; ");
        append(joiner, "MRI Report", request.getMriReport());
        append(joiner, "Lab Report", request.getLabReport());
        append(joiner, "Prescription", request.getPrescription());
        append(joiner, "Medical History", request.getMedicalHistory());
        String summary = joiner.toString();
        return summary.isBlank() ? "No attachments provided" : summary;
    }

    private void append(StringJoiner joiner, String label, String value) {
        if (hasText(value)) {
            joiner.add(label + ": " + value);
        }
    }

    private String safeId(String value) {
        return value.toLowerCase().replaceAll("[^a-z0-9\\-]", "-");
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String defaultText(String value, String fallback) {
        return hasText(value) ? value : fallback;
    }
}