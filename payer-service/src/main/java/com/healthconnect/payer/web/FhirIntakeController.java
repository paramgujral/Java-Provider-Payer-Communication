package com.healthconnect.payer.web;

import com.healthconnect.common.fhir.FhirNames;
import com.healthconnect.common.fhir.PriorAuthFhirMapper;
import com.healthconnect.payer.service.CaseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** FHIR endpoint for prior-authorization submissions. */
@RestController
@RequestMapping("/fhir")
public class FhirIntakeController {

    private static final Logger log = LoggerFactory.getLogger(FhirIntakeController.class);

    private final CaseService caseService;
    private final PriorAuthFhirMapper fhirMapper;

    public FhirIntakeController(CaseService caseService, PriorAuthFhirMapper fhirMapper) {
        this.caseService = caseService;
        this.fhirMapper = fhirMapper;
    }

    @PostMapping(value = "/Claim/$submit",
            consumes = {FhirNames.FHIR_JSON, MediaType.APPLICATION_JSON_VALUE},
            produces = FhirNames.FHIR_JSON)
    public ResponseEntity<String> submit(@RequestBody String bundleJson) {
        try {
            return ResponseEntity.ok(caseService.intake(bundleJson));
        } catch (CaseService.InvalidSubmissionException e) {
            return ResponseEntity.badRequest().body(fhirMapper.toOperationOutcomeJson(e.getMessage()));
        } catch (Exception e) {
            log.warn("Rejected malformed claim bundle: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(fhirMapper.toOperationOutcomeJson("Unable to parse Claim bundle: " + e.getMessage()));
        }
    }
}
