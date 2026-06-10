package com.connector.auth.web;

import com.connector.auth.domain.AuthorizationRequest;
import com.connector.auth.domain.CopilotReview;
import com.connector.auth.dto.CreateRequestDto;
import com.connector.auth.service.AuthorizationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Provider module: build requests, get a Copilot review, submit, resubmit. */
@RestController
@RequestMapping("/api/provider")
public class ProviderController {

    private final AuthorizationService service;

    public ProviderController(AuthorizationService service) { this.service = service; }

    /** AI Copilot pre-submission review (does not persist). */
    @PostMapping("/copilot/review")
    public CopilotReview review(@RequestBody CreateRequestDto dto) {
        return service.previewReview(dto);
    }

    /** Submit a new prior-authorization request to the payer. */
    @PostMapping("/requests")
    public AuthorizationRequest submit(@Valid @RequestBody CreateRequestDto dto) {
        return service.submit(dto);
    }

    /** Respond to an INFO_REQUESTED item with extra documentation. */
    @PostMapping("/requests/{id}/resubmit")
    public AuthorizationRequest resubmit(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.resubmit(id, body.get("addedNotes"));
    }
}
