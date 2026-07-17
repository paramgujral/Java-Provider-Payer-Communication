package com.sana.healthcareconnector.controller;

import ca.uhn.fhir.context.FhirContext;
import com.sana.healthcareconnector.dto.ClaimValidationRequestDTO;
import com.sana.healthcareconnector.dto.ClaimValidationResponseDTO;
import com.sana.healthcareconnector.service.ClaimValidationService;
import org.hl7.fhir.r4.model.OperationOutcome;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/fhir/Claim")
public class ClaimValidationController {

    @Autowired
    private ClaimValidationService claimValidationService;

    @PostMapping("/validate")
    public String validate(
            @RequestBody ClaimValidationRequestDTO request) {

        ClaimValidationResponseDTO response =
                claimValidationService.validate(request);

        OperationOutcome outcome =
                new OperationOutcome();

        OperationOutcome.OperationOutcomeIssueComponent
                recommendationIssue =
                outcome.addIssue();

        recommendationIssue.setSeverity(
                OperationOutcome.IssueSeverity.INFORMATION);

        recommendationIssue.setCode(
                OperationOutcome.IssueType.INFORMATIONAL);

        recommendationIssue.getDetails().setText(
                response.getRecommendation());

        OperationOutcome.OperationOutcomeIssueComponent
                confidenceIssue =
                outcome.addIssue();

        confidenceIssue.setSeverity(
                OperationOutcome.IssueSeverity.INFORMATION);

        confidenceIssue.setCode(
                OperationOutcome.IssueType.INFORMATIONAL);

        confidenceIssue.getDetails().setText(
                "Confidence Score: "
                        + response.getConfidenceScore()
                        + "%");

        FhirContext fhirContext =
                FhirContext.forR4();

        return fhirContext
                .newJsonParser()
                .setPrettyPrint(true)
                .encodeResourceToString(outcome);
    }
}