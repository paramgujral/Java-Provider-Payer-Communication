package com.healthcare.connector.fhir.service;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import com.healthcare.connector.authorization.entity.AuthorizationRequest;
import com.healthcare.connector.fhir.dto.FhirValidationResult;
import lombok.extern.slf4j.Slf4j;
import org.hl7.fhir.r4.model.*;
import org.springframework.stereotype.Service;

import java.util.Date;

/**
 * FHIR R4 Service - builds CoverageEligibilityRequest / ClaimResponse
 * resources per CMS/FHIR prior-authorization standards (FHIR R4 + Da Vinci PAS IG).
 */
@Slf4j
@Service
public class FhirService {

    private final FhirContext fhirContext = FhirContext.forR4();

    /**
     * Builds a FHIR R4 Claim resource representing a prior-authorization request.
     * Conforms to the Da Vinci Prior Authorization Support (PAS) IG.
     */
    public String buildClaimResource(AuthorizationRequest request) {
        Claim claim = new Claim();
        claim.setId("auth-" + request.getReferenceNumber());
        claim.setStatus(Claim.ClaimStatus.ACTIVE);
        claim.setUse(Claim.Use.PREAUTHORIZATION);

        // Claim type: professional / institutional
        claim.setType(new CodeableConcept()
                .addCoding(new Coding()
                        .setSystem("http://terminology.hl7.org/CodeSystem/claim-type")
                        .setCode("professional")));

        claim.setCreated(new Date());

        // Patient reference
        Reference patientRef = new Reference("Patient/" + request.getPatientId());
        patientRef.setDisplay(request.getPatientName());
        claim.setPatient(patientRef);

        // Provider (billing)
        Reference providerRef = new Reference("Practitioner/" + request.getProviderNpi());
        providerRef.setDisplay(request.getProviderName());
        claim.setProvider(providerRef);

        // Insurer (payer)
        Reference insurerRef = new Reference("Organization/" + request.getPayerOrganizationId());
        insurerRef.setDisplay(request.getPayerName());
        claim.setInsurer(insurerRef);

        // Priority
        String priorityCode = request.getPriority() != null
                ? request.getPriority().name().toLowerCase() : "normal";
        claim.setPriority(new CodeableConcept()
                .addCoding(new Coding()
                        .setSystem("http://terminology.hl7.org/CodeSystem/processpriority")
                        .setCode(priorityCode)));

        // Diagnosis
        Claim.DiagnosisComponent diagnosis = new Claim.DiagnosisComponent();
        diagnosis.setSequence(1);
        diagnosis.setDiagnosis(new CodeableConcept()
                .addCoding(new Coding()
                        .setSystem("http://hl7.org/fhir/sid/icd-10-cm")
                        .setCode(request.getDiagnosisCode())
                        .setDisplay(request.getDiagnosisDescription())));
        claim.addDiagnosis(diagnosis);

        // Procedure / Service Item
        Claim.ItemComponent item = new Claim.ItemComponent();
        item.setSequence(1);
        item.addDiagnosisSequence(1);
        item.setProductOrService(new CodeableConcept()
                .addCoding(new Coding()
                        .setSystem("http://www.ama-assn.org/go/cpt")
                        .setCode(request.getProcedureCode())
                        .setDisplay(request.getProcedureDescription())));

        if (request.getRequestedStartDate() != null) {
            item.setServiced(new DateType(request.getRequestedStartDate().toString()));
        }

        if (request.getNumberOfUnits() != null) {
            item.setQuantity(new Quantity().setValue(request.getNumberOfUnits()));
        }
        claim.addItem(item);

        // Insurance coverage
        Claim.InsuranceComponent insurance = new Claim.InsuranceComponent();
        insurance.setSequence(1);
        insurance.setFocal(true);
        Reference coverageRef = new Reference("Coverage/" + request.getPatientMemberId());
        insurance.setCoverage(coverageRef);
        claim.addInsurance(insurance);

        // Supporting info - clinical notes
        if (request.getClinicalNotes() != null && !request.getClinicalNotes().isBlank()) {
            Claim.SupportingInformationComponent supportInfo = new Claim.SupportingInformationComponent();
            supportInfo.setSequence(1);
            supportInfo.setCategory(new CodeableConcept()
                    .addCoding(new Coding()
                            .setSystem("http://terminology.hl7.org/CodeSystem/claiminformationcategory")
                            .setCode("info")));
            supportInfo.setValue(new StringType(request.getClinicalNotes()));
            claim.addSupportingInfo(supportInfo);
        }

        IParser parser = fhirContext.newJsonParser().setPrettyPrint(true);
        return parser.encodeResourceToString(claim);
    }

    /**
     * Builds a FHIR Bundle wrapping the Claim + Patient + Coverage resources.
     */
    public String buildAuthorizationBundle(AuthorizationRequest request) {
        Bundle bundle = new Bundle();
        bundle.setType(Bundle.BundleType.COLLECTION);
        bundle.setId("bundle-" + request.getReferenceNumber());

        // Add Claim
        String claimJson = buildClaimResource(request);
        Claim claim = fhirContext.newJsonParser().parseResource(Claim.class, claimJson);
        bundle.addEntry().setResource(claim).setFullUrl("urn:uuid:" + request.getReferenceNumber());

        // Add Patient stub
        Patient patient = new Patient();
        patient.setId(request.getPatientId());
        patient.addName().setText(request.getPatientName());
        if (request.getPatientDob() != null) {
            try {
                patient.setBirthDateElement(new DateType(request.getPatientDob()));
            } catch (Exception ignored) {}
        }
        bundle.addEntry().setResource(patient).setFullUrl("Patient/" + request.getPatientId());

        IParser parser = fhirContext.newJsonParser().setPrettyPrint(true);
        return parser.encodeResourceToString(bundle);
    }

    /**
     * Validates basic FHIR compliance of the request data.
     */
    public FhirValidationResult validateAuthorizationRequest(AuthorizationRequest request) {
        FhirValidationResult result = new FhirValidationResult();

        if (request.getDiagnosisCode() == null || request.getDiagnosisCode().isBlank()) {
            result.addIssue("MISSING_DIAGNOSIS", "ICD-10 diagnosis code is required");
        } else if (!request.getDiagnosisCode().matches("[A-Z][0-9]{2}(\\.[0-9A-Z]{1,4})?")) {
            result.addIssue("INVALID_DIAGNOSIS_FORMAT", "ICD-10 code format invalid: " + request.getDiagnosisCode());
        }

        if (request.getProcedureCode() == null || request.getProcedureCode().isBlank()) {
            result.addIssue("MISSING_PROCEDURE", "CPT procedure code is required");
        } else if (!request.getProcedureCode().matches("[0-9]{5}[A-Z]?")) {
            result.addIssue("INVALID_CPT_FORMAT", "CPT code format invalid: " + request.getProcedureCode());
        }

        if (request.getPatientMemberId() == null || request.getPatientMemberId().isBlank()) {
            result.addIssue("MISSING_MEMBER_ID", "Patient insurance member ID is required for FHIR Coverage");
        }

        if (request.getProviderNpi() == null || request.getProviderNpi().isBlank()) {
            result.addIssue("MISSING_NPI", "Provider NPI is required");
        } else if (!request.getProviderNpi().matches("[0-9]{10}")) {
            result.addIssue("INVALID_NPI", "NPI must be 10 digits");
        }

        if (request.getRequestedStartDate() == null) {
            result.addIssue("MISSING_START_DATE", "Requested service start date is required");
        }

        result.setValid(result.getIssues().isEmpty());
        return result;
    }
}
