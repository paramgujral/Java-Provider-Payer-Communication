package com.healthconnect.provider.web;

import com.healthconnect.common.model.AuthorizationStatus;
import com.healthconnect.provider.copilot.CopilotReport;
import com.healthconnect.provider.domain.AuthorizationRequest;
import com.healthconnect.provider.service.AuthorizationRequestService;
import com.healthconnect.provider.web.dto.AuthorizationRequestDto;
import com.healthconnect.provider.web.dto.RequestDetailDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class AuthorizationRequestController {

    private final AuthorizationRequestService service;

    public AuthorizationRequestController(AuthorizationRequestService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AuthorizationRequest create(@RequestBody AuthorizationRequestDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public AuthorizationRequest update(@PathVariable Long id, @RequestBody AuthorizationRequestDto dto) {
        return service.update(id, dto);
    }

    @GetMapping
    public List<AuthorizationRequest> list(@RequestParam(required = false) AuthorizationStatus status) {
        return service.list(status);
    }

    @GetMapping("/{id}")
    public RequestDetailDto detail(@PathVariable Long id) {
        return new RequestDetailDto(service.get(id), service.historyOf(id));
    }

    @PostMapping("/{id}/copilot")
    public CopilotReport copilot(@PathVariable Long id) {
        return service.copilotReview(id);
    }

    /** Submits to the payer; 422 if the copilot finds errors. */
    @PostMapping("/{id}/submit")
    public AuthorizationRequest submit(@PathVariable Long id) {
        return service.submit(id);
    }
}
