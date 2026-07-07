package com.healthconnect.common.fhir;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import com.healthconnect.common.model.AuthorizationStatus;
import com.healthconnect.common.model.DecisionData;
import com.healthconnect.common.model.PriorAuthData;
import com.healthconnect.common.model.Urgency;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Claim;
import org.hl7.fhir.r4.model.ClaimResponse;
import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.Coding;
import org.hl7.fhir.r4.model.Coverage;
import org.hl7.fhir.r4.model.DateType;
import org.hl7.fhir.r4.model.Enumerations;
import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.Identifier;
import org.hl7.fhir.r4.model.Money;
import org.hl7.fhir.r4.model.OperationOutcome;
import org.hl7.fhir.r4.model.Organization;
import org.hl7.fhir.r4.model.Patient;
import org.hl7.fhir.r4.model.Reference;
import org.hl7.fhir.r4.model.Resource;
import org.hl7.fhir.r4.model.StringType;

import java.time.LocalDate;
import java.util.Date;
import java.util.UUID;

/** Maps between the app's data objects and FHIR R4 resources (Claim / ClaimResponse). */
public class PriorAuthFhirMapper {

    private final FhirContext fhirContext = FhirContext.forR4Cached();

    public FhirContext context() {
        return fhirContext;
    }

    private IParser parser() {
        return fhirContext.newJsonParser().setPrettyPrint(true);
    }

    // ---------------------------------------------------------------------
    // Request: PriorAuthData -> Bundle(Claim + Patient + Coverage + Organizations)
    // ---------------------------------------------------------------------

    public String toRequestBundleJson(PriorAuthData data) {
        return parser().encodeResourceToString(toRequestBundle(data));
    }

    public Bundle toRequestBundle(PriorAuthData data) {
        Bundle bundle = new Bundle();
        bundle.setType(Bundle.BundleType.COLLECTION);

        Patient patient = buildPatient(data);
        Organization providerOrg = buildProviderOrganization(data);
        Organization payerOrg = new Organization();
        payerOrg.setName(data.getPayerName());
        Coverage coverage = buildCoverage(data, patient, payerOrg);

        String patientUrl = addEntry(bundle, patient);
        String providerUrl = addEntry(bundle, providerOrg);
        String payerUrl = addEntry(bundle, payerOrg);
        coverage.setBeneficiary(new Reference(patientUrl));
        coverage.getPayorFirstRep().setReference(payerUrl);
        String coverageUrl = addEntry(bundle, coverage);

        Claim claim = new Claim();
        claim.setStatus(Claim.ClaimStatus.ACTIVE);
        claim.setUse(Claim.Use.PREAUTHORIZATION);
        claim.setCreated(new Date());
        claim.addIdentifier()
                .setSystem(FhirNames.REQUEST_NUMBER_SYSTEM)
                .setValue(data.getRequestNumber());
        claim.setType(codeable(FhirNames.CLAIM_TYPE_SYSTEM, "professional", "Professional"));
        claim.setPriority(codeable(FhirNames.PROCESS_PRIORITY_SYSTEM,
                data.getUrgency() == Urgency.ROUTINE ? "normal" : "stat", null));
        claim.setPatient(new Reference(patientUrl));
        claim.setProvider(new Reference(providerUrl));
        claim.setInsurer(new Reference(payerUrl));

        claim.addInsurance()
                .setSequence(1)
                .setFocal(true)
                .setCoverage(new Reference(coverageUrl));

        if (notBlank(data.getDiagnosisCode())) {
            claim.addDiagnosis()
                    .setSequence(1)
                    .setDiagnosis(codeable(FhirNames.ICD10_SYSTEM,
                            data.getDiagnosisCode(), data.getDiagnosisDescription()));
        }

        Claim.ItemComponent item = claim.addItem().setSequence(1);
        if (notBlank(data.getProcedureCode())) {
            item.setProductOrService(codeable(FhirNames.CPT_SYSTEM,
                    data.getProcedureCode(), data.getProcedureDescription()));
        }
        if (data.getServiceDate() != null) {
            item.setServiced(new DateType(data.getServiceDate().toString()));
        }
        if (data.getRequestedAmount() != null) {
            Money amount = new Money().setValue(data.getRequestedAmount()).setCurrency("USD");
            item.setUnitPrice(amount);
            item.setNet(amount.copy());
            claim.setTotal(amount.copy());
        }

        int seq = 1;
        if (notBlank(data.getClinicalJustification())) {
            claim.addSupportingInfo()
                    .setSequence(seq++)
                    .setCategory(codeable(FhirNames.CLAIM_INFO_CATEGORY_SYSTEM, "info", "Information"))
                    .setValue(new StringType(data.getClinicalJustification()));
        }
        claim.addSupportingInfo()
                .setSequence(seq)
                .setCategory(codeable(FhirNames.SUPPORTING_INFO_SYSTEM, FhirNames.URGENCY_CODE, "Urgency"))
                .setValue(new StringType(data.getUrgency().name()));

        addEntry(bundle, claim);
        return bundle;
    }

    private Patient buildPatient(PriorAuthData data) {
        Patient patient = new Patient();
        HumanName name = patient.addName();
        if (notBlank(data.getPatientLastName())) {
            name.setFamily(data.getPatientLastName());
        }
        if (notBlank(data.getPatientFirstName())) {
            name.addGiven(data.getPatientFirstName());
        }
        if (data.getPatientDob() != null) {
            patient.setBirthDateElement(new DateType(data.getPatientDob().toString()));
        }
        patient.setGender(parseGender(data.getPatientGender()));
        if (notBlank(data.getMemberId())) {
            patient.addIdentifier()
                    .setSystem(FhirNames.MEMBER_ID_SYSTEM)
                    .setValue(data.getMemberId());
        }
        return patient;
    }

    private Organization buildProviderOrganization(PriorAuthData data) {
        Organization org = new Organization();
        org.setName(data.getProviderName());
        if (notBlank(data.getProviderNpi())) {
            org.addIdentifier()
                    .setSystem(FhirNames.NPI_SYSTEM)
                    .setValue(data.getProviderNpi());
        }
        return org;
    }

    private Coverage buildCoverage(PriorAuthData data, Patient patient, Organization payerOrg) {
        Coverage coverage = new Coverage();
        coverage.setStatus(Coverage.CoverageStatus.ACTIVE);
        if (notBlank(data.getMemberId())) {
            coverage.setSubscriberId(data.getMemberId());
        }
        if (notBlank(data.getInsurancePlan())) {
            coverage.setType(new CodeableConcept().setText(data.getInsurancePlan()));
        }
        return coverage;
    }

    // ---------------------------------------------------------------------
    // Request: Bundle -> PriorAuthData
    // ---------------------------------------------------------------------

    public PriorAuthData fromRequestBundleJson(String json) {
        Bundle bundle = parser().parseResource(Bundle.class, json);
        return fromRequestBundle(bundle);
    }

    public PriorAuthData fromRequestBundle(Bundle bundle) {
        Claim claim = firstResource(bundle, Claim.class);
        if (claim == null) {
            throw new IllegalArgumentException("Bundle does not contain a Claim resource");
        }
        PriorAuthData data = new PriorAuthData();
        data.setRequestNumber(claim.getIdentifierFirstRep().getValue());

        Patient patient = resolve(bundle, claim.getPatient(), Patient.class);
        if (patient != null) {
            HumanName name = patient.getNameFirstRep();
            data.setPatientLastName(name.getFamily());
            data.setPatientFirstName(name.getGiven().isEmpty() ? null : name.getGiven().get(0).getValue());
            if (patient.hasBirthDateElement()) {
                data.setPatientDob(LocalDate.parse(patient.getBirthDateElement().getValueAsString()));
            }
            if (patient.getGender() != null) {
                data.setPatientGender(patient.getGender().toCode());
            }
            data.setMemberId(patient.getIdentifierFirstRep().getValue());
        }

        Organization providerOrg = resolve(bundle, claim.getProvider(), Organization.class);
        if (providerOrg != null) {
            data.setProviderName(providerOrg.getName());
            data.setProviderNpi(providerOrg.getIdentifierFirstRep().getValue());
        }

        Organization payerOrg = resolve(bundle, claim.getInsurer(), Organization.class);
        if (payerOrg != null) {
            data.setPayerName(payerOrg.getName());
        }

        if (claim.hasInsurance()) {
            Coverage coverage = resolve(bundle, claim.getInsuranceFirstRep().getCoverage(), Coverage.class);
            if (coverage != null) {
                if (data.getMemberId() == null) {
                    data.setMemberId(coverage.getSubscriberId());
                }
                if (coverage.hasType()) {
                    data.setInsurancePlan(coverage.getType().getText());
                }
            }
        }

        if (claim.hasDiagnosis()) {
            Coding diagnosis = claim.getDiagnosisFirstRep().getDiagnosisCodeableConcept().getCodingFirstRep();
            data.setDiagnosisCode(diagnosis.getCode());
            data.setDiagnosisDescription(diagnosis.getDisplay());
        }

        if (claim.hasItem()) {
            Claim.ItemComponent item = claim.getItemFirstRep();
            Coding procedure = item.getProductOrService().getCodingFirstRep();
            data.setProcedureCode(procedure.getCode());
            data.setProcedureDescription(procedure.getDisplay());
            if (item.hasServicedDateType()) {
                data.setServiceDate(LocalDate.parse(item.getServicedDateType().getValueAsString()));
            }
        }
        if (claim.hasTotal()) {
            data.setRequestedAmount(claim.getTotal().getValue());
        }

        for (Claim.SupportingInformationComponent info : claim.getSupportingInfo()) {
            String category = info.getCategory().getCodingFirstRep().getCode();
            String value = info.getValue() instanceof StringType stringValue ? stringValue.getValue() : null;
            if (FhirNames.URGENCY_CODE.equals(category)) {
                data.setUrgency(Urgency.fromString(value));
            } else if ("info".equals(category)) {
                data.setClinicalJustification(value);
            }
        }
        return data;
    }

    // ---------------------------------------------------------------------
    // Decision: DecisionData <-> ClaimResponse
    // ---------------------------------------------------------------------

    public String toClaimResponseJson(DecisionData decision, PriorAuthData request) {
        ClaimResponse response = new ClaimResponse();
        response.setStatus(ClaimResponse.ClaimResponseStatus.ACTIVE);
        response.setType(codeable(FhirNames.CLAIM_TYPE_SYSTEM, "professional", "Professional"));
        response.setUse(ClaimResponse.Use.PREAUTHORIZATION);
        response.setCreated(new Date());
        response.setOutcome(toOutcome(decision.getStatus()));
        if (notBlank(decision.getNote())) {
            response.setDisposition(decision.getNote());
        }
        if (notBlank(decision.getCaseNumber())) {
            response.setPreAuthRef(decision.getCaseNumber());
        }
        response.setRequest(new Reference().setIdentifier(new Identifier()
                .setSystem(FhirNames.REQUEST_NUMBER_SYSTEM)
                .setValue(decision.getRequestNumber())));
        if (request != null) {
            response.setPatient(new Reference().setDisplay(
                    request.getPatientFirstName() + " " + request.getPatientLastName()));
            response.setInsurer(new Reference().setDisplay(request.getPayerName()));
        }
        return parser().encodeResourceToString(response);
    }

    public DecisionData fromClaimResponseJson(String json) {
        ClaimResponse response = parser().parseResource(ClaimResponse.class, json);
        DecisionData decision = new DecisionData();
        decision.setRequestNumber(response.getRequest().getIdentifier().getValue());
        decision.setCaseNumber(response.getPreAuthRef());
        decision.setStatus(fromOutcome(response.getOutcome()));
        decision.setNote(response.getDisposition());
        return decision;
    }

    private ClaimResponse.RemittanceOutcome toOutcome(AuthorizationStatus status) {
        return switch (status) {
            case APPROVED -> ClaimResponse.RemittanceOutcome.COMPLETE;
            case REJECTED -> ClaimResponse.RemittanceOutcome.ERROR;
            case INFO_REQUESTED -> ClaimResponse.RemittanceOutcome.PARTIAL;
            default -> ClaimResponse.RemittanceOutcome.QUEUED;
        };
    }

    private AuthorizationStatus fromOutcome(ClaimResponse.RemittanceOutcome outcome) {
        return switch (outcome) {
            case COMPLETE -> AuthorizationStatus.APPROVED;
            case ERROR -> AuthorizationStatus.REJECTED;
            case PARTIAL -> AuthorizationStatus.INFO_REQUESTED;
            default -> AuthorizationStatus.PENDING_REVIEW;
        };
    }

    /** Error payload for malformed submissions. */
    public String toOperationOutcomeJson(String message) {
        OperationOutcome outcome = new OperationOutcome();
        outcome.addIssue()
                .setSeverity(OperationOutcome.IssueSeverity.ERROR)
                .setCode(OperationOutcome.IssueType.INVALID)
                .setDiagnostics(message);
        return parser().encodeResourceToString(outcome);
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    private String addEntry(Bundle bundle, Resource resource) {
        String fullUrl = "urn:uuid:" + UUID.randomUUID();
        bundle.addEntry().setFullUrl(fullUrl).setResource(resource);
        return fullUrl;
    }

    private <T extends Resource> T firstResource(Bundle bundle, Class<T> type) {
        for (Bundle.BundleEntryComponent entry : bundle.getEntry()) {
            if (type.isInstance(entry.getResource())) {
                return type.cast(entry.getResource());
            }
        }
        return null;
    }

    private <T extends Resource> T resolve(Bundle bundle, Reference reference, Class<T> type) {
        if (reference == null || reference.getReference() == null) {
            return null;
        }
        for (Bundle.BundleEntryComponent entry : bundle.getEntry()) {
            if (reference.getReference().equals(entry.getFullUrl()) && type.isInstance(entry.getResource())) {
                return type.cast(entry.getResource());
            }
        }
        return null;
    }

    private CodeableConcept codeable(String system, String code, String display) {
        Coding coding = new Coding().setSystem(system).setCode(code);
        if (notBlank(display)) {
            coding.setDisplay(display);
        }
        return new CodeableConcept().addCoding(coding);
    }

    private Enumerations.AdministrativeGender parseGender(String gender) {
        if (gender == null || gender.isBlank()) {
            return Enumerations.AdministrativeGender.UNKNOWN;
        }
        try {
            return Enumerations.AdministrativeGender.fromCode(gender.trim().toLowerCase());
        } catch (Exception e) {
            return Enumerations.AdministrativeGender.UNKNOWN;
        }
    }

    private boolean notBlank(String value) {
        return value != null && !value.isBlank();
    }
}
