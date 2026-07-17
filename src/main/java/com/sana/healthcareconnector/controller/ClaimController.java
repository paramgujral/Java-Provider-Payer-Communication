package com.sana.healthcareconnector.controller;

import ca.uhn.fhir.context.FhirContext;
import com.sana.healthcareconnector.entity.ClaimEntity;
import com.sana.healthcareconnector.entity.ClaimStatus;
import com.sana.healthcareconnector.service.ClaimService;
import org.hl7.fhir.r4.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/fhir/Claim")
public class ClaimController {

    @Autowired
    private ClaimService claimService;

    private final FhirContext fhirContext =
            FhirContext.forR4();

    private Claim convertToFhirClaim(
            ClaimEntity claimEntity) {

        Claim claim = new Claim();

        claim.setId(
                claimEntity.getId().toString());

        // Status Mapping
        if (claimEntity.getStatus()
                == ClaimStatus.APPROVED) {

            claim.setStatus(
                    Claim.ClaimStatus.ACTIVE);

        } else if (claimEntity.getStatus()
                == ClaimStatus.REJECTED) {

            claim.setStatus(
                    Claim.ClaimStatus.CANCELLED);

        } else {

            claim.setStatus(
                    Claim.ClaimStatus.DRAFT);
        }

        // Patient Name
        claim.setPatient(
                new Reference()
                        .setDisplay(
                                claimEntity.getPatientName()));

        // Provider
        claim.setProvider(
                new Reference()
                        .setDisplay(
                                claimEntity.getProvider()));

        // Payer
        claim.setInsurer(
                new Reference()
                        .setDisplay(
                                claimEntity.getPayer()));

        // Diagnosis
        Claim.DiagnosisComponent diagnosis =
                new Claim.DiagnosisComponent();

        diagnosis.setDiagnosis(
                new CodeableConcept()
                        .setText(
                                claimEntity.getDiagnosis()));

        claim.addDiagnosis(
                diagnosis);

        // Treatment
        Claim.ItemComponent item =
                new Claim.ItemComponent();

        item.setProductOrService(
                new CodeableConcept()
                        .setText(
                                claimEntity.getTreatment()));

        claim.addItem(
                item);

        // Estimated Cost
        Money money =
                new Money();

        if (claimEntity.getEstimatedCost() != null) {

            money.setValue(
                    BigDecimal.valueOf(
                            claimEntity.getEstimatedCost()));

            money.setCurrency(
                    "INR");

            claim.setTotal(
                    money);
        }

        return claim;
    }
    @PostMapping
    public String createClaim(
            @RequestBody ClaimEntity claim) {

        claim.setStatus(
                ClaimStatus.PENDING);

        ClaimEntity savedClaim =
                claimService.saveClaim(claim);

        return fhirContext
                .newJsonParser()
                .setPrettyPrint(true)
                .encodeResourceToString(
                        convertToFhirClaim(savedClaim));
    }

    @GetMapping
    public String getAllClaims() {

        List<ClaimEntity> claims =
                claimService.getAllClaims();

        Bundle bundle =
                new Bundle();

        bundle.setType(
                Bundle.BundleType.SEARCHSET);

        for (ClaimEntity claim : claims) {

            bundle.addEntry()
                    .setResource(
                            convertToFhirClaim(claim));
        }

        return fhirContext
                .newJsonParser()
                .setPrettyPrint(true)
                .encodeResourceToString(
                        bundle);
    }

    @PutMapping("/{id}/approve")
    public String approveClaim(
            @PathVariable Long id) {

        ClaimEntity claim =
                claimService.getClaimById(id);

        claim.setStatus(
                ClaimStatus.APPROVED);

        ClaimEntity savedClaim =
                claimService.saveClaim(claim);

        return fhirContext
                .newJsonParser()
                .setPrettyPrint(true)
                .encodeResourceToString(
                        convertToFhirClaim(savedClaim));
    }

    @PutMapping("/{id}/reject")
    public String rejectClaim(
            @PathVariable Long id) {

        ClaimEntity claim =
                claimService.getClaimById(id);

        claim.setStatus(
                ClaimStatus.REJECTED);

        ClaimEntity savedClaim =
                claimService.saveClaim(claim);

        return fhirContext
                .newJsonParser()
                .setPrettyPrint(true)
                .encodeResourceToString(
                        convertToFhirClaim(savedClaim));
    }
}