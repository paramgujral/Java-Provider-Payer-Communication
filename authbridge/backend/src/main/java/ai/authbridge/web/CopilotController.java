package ai.authbridge.web;

import ai.authbridge.copilot.CopilotReview;
import ai.authbridge.domain.AuthorizationRequest;
import ai.authbridge.domain.Enums.Priority;
import ai.authbridge.service.AuthorizationRequestService;
import ai.authbridge.web.dto.RequestDtos.CreateRequest;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

/** Stateless AI copilot endpoint used for live, pre-submission review. */
@RestController
@RequestMapping("/api/v1/copilot")
public class CopilotController {

    private final AuthorizationRequestService service;

    public CopilotController(AuthorizationRequestService service) { this.service = service; }

    @PostMapping
    public Map<String, Object> review(@RequestBody CreateRequest in) {
        AuthorizationRequest draft = new AuthorizationRequest();
        draft.setServiceRequested(in.serviceRequested());
        if (in.cptCodes() != null) draft.setCptCodes(in.cptCodes());
        if (in.icd10Codes() != null) draft.setIcd10Codes(in.icd10Codes());
        draft.setClinicalJustification(in.clinicalJustification());
        draft.setRequestedUnits(in.requestedUnits());
        draft.setPriority(in.priority() == null ? Priority.ROUTINE : in.priority());
        if (in.documents() != null) {
            in.documents().forEach(d -> {
                var doc = new ai.authbridge.domain.ClinicalDocument();
                doc.setName(d.name()); doc.setType(d.type()); doc.setSizeKb(d.sizeKb());
                draft.addDocument(doc);
            });
        }
        CopilotReview review = service.preview(draft);
        return Map.of("data", review);
    }
}
