package com.connector.auth.mapper;

import com.connector.auth.domain.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Component;

/**
 * Maps internal entities to FHIR R4 resources aligned with the Da Vinci
 * Prior-Authorization Support (PAS) approach: a prior-auth request is a
 * Claim with use = "preauthorization", and the payer answer is a ClaimResponse.
 * Resources are assembled as a FHIR Bundle (type = collection).
 */
@Component
public class FhirMapper {

    private static final String SYS_ICD10 = "http://hl7.org/fhir/sid/icd-10-cm";
    private static final String SYS_CPT    = "http://www.ama-assn.org/go/cpt";
    private static final String SYS_CLAIMTYPE = "http://terminology.hl7.org/CodeSystem/claim-type";

    private final ObjectMapper om = new ObjectMapper();

    /** Full FHIR Bundle: Claim + Patient + Coverage + Practitioner + Organization. */
    public ObjectNode toBundle(AuthorizationRequest r) {
        ObjectNode bundle = om.createObjectNode();
        bundle.put("resourceType", "Bundle");
        bundle.put("type", "collection");
        bundle.put("timestamp", String.valueOf(r.getUpdatedAt()));
        ArrayNode entries = bundle.putArray("entry");

        entries.addObject().set("resource", toClaim(r));
        entries.addObject().set("resource", toPatient(r));
        entries.addObject().set("resource", toCoverage(r));
        entries.addObject().set("resource", toPractitioner(r));
        entries.addObject().set("resource", toInsurerOrganization(r));
        if (r.getDecision() != null) {
            entries.addObject().set("resource", toClaimResponse(r));
        }
        return bundle;
    }

    public ObjectNode toClaim(AuthorizationRequest r) {
        ObjectNode claim = om.createObjectNode();
        claim.put("resourceType", "Claim");
        claim.put("id", "claim-" + safe(r.getReference()));

        ArrayNode identifier = claim.putArray("identifier");
        identifier.addObject()
                .put("system", "https://connector.health/prior-auth")
                .put("value", r.getReference());

        claim.put("status", "active");
        claim.set("type", codeable(SYS_CLAIMTYPE, "professional", "Professional"));
        claim.put("use", "preauthorization");
        claim.set("patient", reference("Patient/" + safe(r.getPatientMrn()), r.getPatientName()));
        claim.put("created", String.valueOf(r.getCreatedAt()));
        claim.set("provider", reference("Practitioner/" + safe(r.getProviderNpi()), r.getProviderName()));
        claim.set("priority", codeable(
                "http://terminology.hl7.org/CodeSystem/processpriority",
                (r.getPriority() == null ? "normal" : r.getPriority().toLowerCase()), r.getPriority()));

        // insurance / coverage
        ArrayNode insurance = claim.putArray("insurance");
        ObjectNode ins = insurance.addObject();
        ins.put("sequence", 1);
        ins.put("focal", true);
        ins.set("coverage", reference("Coverage/" + safe(r.getMemberId()), r.getPayerName()));

        // diagnoses
        ArrayNode diag = claim.putArray("diagnosis");
        int i = 1;
        for (DiagnosisCode d : r.getDiagnoses()) {
            ObjectNode node = diag.addObject();
            node.put("sequence", i++);
            node.set("diagnosisCodeableConcept", codeable(SYS_ICD10, d.getIcd10Code(), d.getDescription()));
            if (Boolean.TRUE.equals(d.getIsPrincipal())) {
                node.set("type", arrayOf(codeable(
                        "http://terminology.hl7.org/CodeSystem/ex-diagnosistype", "principal", "Principal")));
            }
        }

        // items (requested services)
        ArrayNode items = claim.putArray("item");
        int s = 1;
        for (ServiceLine line : r.getServiceLines()) {
            ObjectNode item = items.addObject();
            item.put("sequence", s++);
            item.set("productOrService", codeable(SYS_CPT, line.getCptCode(), line.getDescription()));
            ObjectNode qty = item.putObject("quantity");
            qty.put("value", line.getUnits() == null ? 1 : line.getUnits());
            if (line.getUnitType() != null) qty.put("unit", line.getUnitType());
            if (r.getServiceStart() != null) item.put("servicedDate", r.getServiceStart());
            if (r.getPlaceOfService() != null) {
                item.set("locationCodeableConcept",
                        codeable("https://www.cms.gov/place-of-service", r.getPlaceOfService(), r.getPlaceOfService()));
            }
        }

        // supporting clinical information
        if (r.getClinicalNotes() != null && !r.getClinicalNotes().isBlank()) {
            ArrayNode supporting = claim.putArray("supportingInfo");
            ObjectNode info = supporting.addObject();
            info.put("sequence", 1);
            info.set("category", codeable(
                    "http://terminology.hl7.org/CodeSystem/claiminformationcategory", "info", "Information"));
            info.put("valueString", r.getClinicalNotes());
        }
        return claim;
    }

    public ObjectNode toClaimResponse(AuthorizationRequest r) {
        ObjectNode cr = om.createObjectNode();
        cr.put("resourceType", "ClaimResponse");
        cr.put("id", "claimresponse-" + safe(r.getReference()));
        cr.put("status", "active");
        cr.set("type", codeable(SYS_CLAIMTYPE, "professional", "Professional"));
        cr.put("use", "preauthorization");
        cr.set("patient", reference("Patient/" + safe(r.getPatientMrn()), r.getPatientName()));
        cr.put("created", String.valueOf(r.getUpdatedAt()));
        cr.set("insurer", reference("Organization/" + safe(r.getPayerName()), r.getPayerName()));
        cr.set("request", reference("Claim/claim-" + safe(r.getReference()), r.getReference()));

        Decision d = r.getDecision();
        String outcome = switch (d) {
            case APPROVED -> "complete";
            case PARTIAL -> "partial";
            case DENIED, INFO_REQUESTED -> "error";
        };
        cr.put("outcome", outcome);
        cr.put("disposition", r.getDecisionRationale() == null ? d.name() : r.getDecisionRationale());

        if (d == Decision.APPROVED || d == Decision.PARTIAL) {
            if (r.getAuthorizationNumber() != null) cr.put("preAuthRef", r.getAuthorizationNumber());
            if (r.getAuthValidFrom() != null && r.getAuthValidTo() != null) {
                ObjectNode period = cr.putObject("preAuthPeriod");
                period.put("start", r.getAuthValidFrom());
                period.put("end", r.getAuthValidTo());
            }
        }

        if (d == Decision.DENIED || d == Decision.INFO_REQUESTED) {
            ArrayNode errors = cr.putArray("error");
            ObjectNode err = errors.addObject();
            err.set("code", codeable("https://connector.health/review-error",
                    d == Decision.DENIED ? "denied" : "info-required",
                    d == Decision.DENIED ? "Not medically necessary" : "Additional information required"));
        }

        ArrayNode notes = cr.putArray("processNote");
        ObjectNode note = notes.addObject();
        note.put("number", 1);
        note.put("type", "display");
        note.put("text", r.getDecisionRationale() == null ? d.name() : r.getDecisionRationale());
        return cr;
    }

    // ---- builders ----
    private ObjectNode toPatient(AuthorizationRequest r) {
        ObjectNode p = om.createObjectNode();
        p.put("resourceType", "Patient");
        p.put("id", safe(r.getPatientMrn()));
        p.putArray("identifier").addObject()
                .put("system", "https://connector.health/mrn").put("value", r.getPatientMrn());
        ArrayNode names = p.putArray("name");
        names.addObject().put("text", r.getPatientName());
        if (r.getPatientGender() != null) p.put("gender", r.getPatientGender());
        if (r.getPatientBirthDate() != null) p.put("birthDate", r.getPatientBirthDate());
        return p;
    }

    private ObjectNode toCoverage(AuthorizationRequest r) {
        ObjectNode c = om.createObjectNode();
        c.put("resourceType", "Coverage");
        c.put("id", safe(r.getMemberId()));
        c.put("status", "active");
        c.set("subscriber", reference("Patient/" + safe(r.getPatientMrn()), r.getPatientName()));
        c.put("subscriberId", r.getMemberId());
        c.set("payor", arrayRef("Organization/" + safe(r.getPayerName()), r.getPayerName()));
        if (r.getPlanName() != null) {
            c.putArray("class").addObject()
                    .put("value", r.getPlanName())
                    .set("type", codeable("http://terminology.hl7.org/CodeSystem/coverage-class", "plan", "Plan"));
        }
        return c;
    }

    private ObjectNode toPractitioner(AuthorizationRequest r) {
        ObjectNode pr = om.createObjectNode();
        pr.put("resourceType", "Practitioner");
        pr.put("id", safe(r.getProviderNpi()));
        pr.putArray("identifier").addObject()
                .put("system", "http://hl7.org/fhir/sid/us-npi").put("value", r.getProviderNpi());
        pr.putArray("name").addObject().put("text", r.getProviderName());
        return pr;
    }

    private ObjectNode toInsurerOrganization(AuthorizationRequest r) {
        ObjectNode org = om.createObjectNode();
        org.put("resourceType", "Organization");
        org.put("id", safe(r.getPayerName()));
        org.put("name", r.getPayerName());
        org.set("type", arrayOf(codeable(
                "http://terminology.hl7.org/CodeSystem/organization-type", "ins", "Insurance Company")));
        return org;
    }

    // ---- helpers ----
    private ObjectNode codeable(String system, String code, String display) {
        ObjectNode cc = om.createObjectNode();
        ArrayNode coding = cc.putArray("coding");
        ObjectNode c = coding.addObject();
        c.put("system", system);
        if (code != null) c.put("code", code);
        if (display != null) c.put("display", display);
        if (display != null) cc.put("text", display);
        return cc;
    }

    private ArrayNode arrayOf(ObjectNode node) {
        ArrayNode a = om.createArrayNode();
        a.add(node);
        return a;
    }

    private ObjectNode reference(String ref, String display) {
        ObjectNode r = om.createObjectNode();
        r.put("reference", ref);
        if (display != null) r.put("display", display);
        return r;
    }

    private ArrayNode arrayRef(String ref, String display) {
        ArrayNode a = om.createArrayNode();
        a.add(reference(ref, display));
        return a;
    }

    private String safe(String v) {
        return v == null ? "unknown" : v.replaceAll("[^A-Za-z0-9-]", "-");
    }
}
