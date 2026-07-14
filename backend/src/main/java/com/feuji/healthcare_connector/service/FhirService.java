package com.feuji.healthcare_connector.service;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import com.feuji.healthcare_connector.entity.AuthorizationRequest;
import com.feuji.healthcare_connector.entity.Document;
import org.hl7.fhir.r4.model.*;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.List;

@Service
public class FhirService {

    private final FhirContext fhirContext = FhirContext.forR4();

    public String generateFhirBundle(AuthorizationRequest request) {
        return generateFhirBundle(request, null);
    }

    public String generateFhirBundle(AuthorizationRequest request, List<Document> documents) {
        try {
            Bundle bundle = new Bundle();
            bundle.setType(Bundle.BundleType.DOCUMENT);

            // 1. Patient Resource
            Patient patient = new Patient();
            patient.setId("patient-1");
            patient.addName().addGiven(request.getPatientFirstName()).setFamily(request.getPatientLastName());
            
            if (request.getPatientDob() != null) {
                patient.setBirthDate(Date.valueOf(request.getPatientDob()));
            }
            
            if (request.getPatientGender() != null) {
                String gender = request.getPatientGender().toUpperCase();
                if (gender.equals("MALE")) {
                    patient.setGender(Enumerations.AdministrativeGender.MALE);
                } else if (gender.equals("FEMALE")) {
                    patient.setGender(Enumerations.AdministrativeGender.FEMALE);
                } else {
                    patient.setGender(Enumerations.AdministrativeGender.OTHER);
                }
            }

            if (request.getPatientPhone() != null) {
                patient.addTelecom().setSystem(ContactPoint.ContactPointSystem.PHONE).setValue(request.getPatientPhone());
            }
            if (request.getPatientEmail() != null) {
                patient.addTelecom().setSystem(ContactPoint.ContactPointSystem.EMAIL).setValue(request.getPatientEmail());
            }
            
            patient.addAddress().setText(request.getPatientAddress());
            bundle.addEntry().setResource(patient).setFullUrl("Patient/patient-1");

            // 2. Provider Organization Resource
            Organization providerOrg = new Organization();
            providerOrg.setId("provider-org");
            providerOrg.setName(request.getProvider().getOrganizationName());
            bundle.addEntry().setResource(providerOrg).setFullUrl("Organization/provider-org");

            // 3. Payer Organization Resource
            Organization payerOrg = new Organization();
            payerOrg.setId("payer-org");
            payerOrg.setName(request.getPayer().getOrganizationName());
            bundle.addEntry().setResource(payerOrg).setFullUrl("Organization/payer-org");

            // 4. Coverage Resource
            Coverage coverage = new Coverage();
            coverage.setId("coverage-1");
            coverage.setStatus(Coverage.CoverageStatus.ACTIVE);
            coverage.addPayor(new Reference("Organization/payer-org"));
            
            coverage.setSubscriber(new Reference("Patient/patient-1"));
            coverage.setSubscriberId(request.getInsurancePolicyNumber());
            
            if (request.getSubscriberRelationship() != null) {
                CodeableConcept rel = new CodeableConcept();
                rel.addCoding().setSystem("http://terminology.hl7.org/CodeSystem/subscriber-relationship")
                        .setCode(request.getSubscriberRelationship().name().toLowerCase());
                coverage.setRelationship(rel);
            }

            Period period = new Period();
            if (request.getCoverageStartDate() != null) {
                period.setStart(Date.valueOf(request.getCoverageStartDate()));
            }
            if (request.getCoverageEndDate() != null) {
                period.setEnd(Date.valueOf(request.getCoverageEndDate()));
            }
            coverage.setPeriod(period);
            bundle.addEntry().setResource(coverage).setFullUrl("Coverage/coverage-1");

            // 5. Claim / Prior Auth Resource
            Claim claim = new Claim();
            claim.setId("claim-1");
            claim.setStatus(Claim.ClaimStatus.ACTIVE);
            
            CodeableConcept claimType = new CodeableConcept();
            claimType.addCoding().setSystem("http://terminology.hl7.org/CodeSystem/claim-type").setCode("professional");
            claim.setType(claimType);
            
            claim.setPatient(new Reference("Patient/patient-1"));
            claim.setProvider(new Reference("Organization/provider-org"));
            claim.setInsurer(new Reference("Organization/payer-org"));
            claim.setUse(Claim.Use.PREAUTHORIZATION);

            // Diagnosis mapping
            Claim.DiagnosisComponent diag = new Claim.DiagnosisComponent();
            diag.setSequence(1);
            CodeableConcept diagCode = new CodeableConcept();
            diagCode.addCoding().setSystem("http://hl7.org/fhir/sid/icd-10")
                    .setCode(request.getPrimaryDiagnosisCode())
                    .setDisplay(request.getPrimaryDiagnosisDesc());
            diag.setDiagnosis(diagCode);
            claim.addDiagnosis(diag);

            // Procedure / Item mapping
            Claim.ItemComponent item = new Claim.ItemComponent();
            item.setSequence(1);
            CodeableConcept procCode = new CodeableConcept();
            procCode.addCoding().setSystem("http://www.ama-assn.org/go/cpt")
                    .setCode(request.getProcedureCode())
                    .setDisplay(request.getProcedureDescription());
            item.setProductOrService(procCode);
            
            if (request.getEstimatedCost() != null) {
                Money money = new Money();
                money.setValue(request.getEstimatedCost());
                money.setCurrency("INR");
                item.setNet(money);
            }
            claim.addItem(item);
            bundle.addEntry().setResource(claim).setFullUrl("Claim/claim-1");

            // 6. ClaimResponse Resource (Payer decision)
            if (request.getStatus() == com.feuji.healthcare_connector.enums.RequestStatus.APPROVED || 
                request.getStatus() == com.feuji.healthcare_connector.enums.RequestStatus.REJECTED || 
                request.getStatus() == com.feuji.healthcare_connector.enums.RequestStatus.INFO_REQUESTED) {
                
                ClaimResponse claimResponse = new ClaimResponse();
                claimResponse.setId("claim-response-1");
                claimResponse.setStatus(ClaimResponse.ClaimResponseStatus.ACTIVE);
                claimResponse.setType(claimType);
                claimResponse.setUse(ClaimResponse.Use.PREAUTHORIZATION);
                claimResponse.setPatient(new Reference("Patient/patient-1"));
                claimResponse.setInsurer(new Reference("Organization/payer-org"));
                claimResponse.setRequest(new Reference("Claim/claim-1"));
                
                if (request.getStatus() == com.feuji.healthcare_connector.enums.RequestStatus.APPROVED) {
                    claimResponse.setOutcome(ClaimResponse.RemittanceOutcome.COMPLETE);
                } else if (request.getStatus() == com.feuji.healthcare_connector.enums.RequestStatus.REJECTED) {
                    claimResponse.setOutcome(ClaimResponse.RemittanceOutcome.ERROR);
                } else {
                    claimResponse.setOutcome(ClaimResponse.RemittanceOutcome.QUEUED);
                }
                
                if (request.getPayerRemarks() != null) {
                    claimResponse.setDisposition(request.getPayerRemarks());
                }
                
                bundle.addEntry().setResource(claimResponse).setFullUrl("ClaimResponse/claim-response-1");
            }
            
            // 7. DocumentReference Resources
            if (documents != null && !documents.isEmpty()) {
                for (int i = 0; i < documents.size(); i++) {
                    Document doc = documents.get(i);
                    DocumentReference docRef = new DocumentReference();
                    String docId = "doc-" + (doc.getId() != null ? doc.getId() : i);
                    docRef.setId(docId);
                    docRef.setStatus(Enumerations.DocumentReferenceStatus.CURRENT);
                    docRef.setSubject(new Reference("Patient/patient-1"));
                    
                    DocumentReference.DocumentReferenceContentComponent content = new DocumentReference.DocumentReferenceContentComponent();
                    Attachment attachment = new Attachment();
                    attachment.setContentType(doc.getFileType());
                    attachment.setTitle(doc.getFileName());
                    attachment.setUrl(doc.getFilePath());
                    if (doc.getFileSize() != null) {
                        attachment.setSize(doc.getFileSize().intValue());
                    }
                    content.setAttachment(attachment);
                    docRef.addContent(content);
                    
                    bundle.addEntry().setResource(docRef).setFullUrl("DocumentReference/" + docId);
                }
            }

            // Serialize to JSON
            IParser parser = fhirContext.newJsonParser();
            parser.setPrettyPrint(true);
            return parser.encodeResourceToString(bundle);
        } catch (Exception e) {
            System.err.println("Failed to generate FHIR bundle: " + e.getMessage());
            return "{}";
        }
    }
}
