package ai.authbridge.web;

import ai.authbridge.domain.AuthorizationRequest;
import ai.authbridge.domain.Enums.RequestStatus;
import ai.authbridge.domain.Enums.Role;
import ai.authbridge.service.AuthorizationRequestService;
import ai.authbridge.web.dto.RequestDtos.CreateRequest;
import ai.authbridge.web.dto.RequestDtos.RequestView;
import ai.authbridge.web.dto.RequestDtos.WorkflowAction;
import ai.authbridge.workflow.WorkflowService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * REST API for authorization requests. Versioned under {@code /api/v1}. Mirrors the Next.js
 * in-memory routes the frontend uses in standalone mode, so the UI can point at either backend.
 */
@RestController
@RequestMapping("/api/v1/requests")
public class AuthorizationRequestController {

    private final AuthorizationRequestService service;
    private final WorkflowService workflow;

    public AuthorizationRequestController(AuthorizationRequestService service, WorkflowService workflow) {
        this.service = service;
        this.workflow = workflow;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) RequestStatus status) {
        List<RequestView> data = service.list(status).stream()
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .map(r -> RequestView.from(r, service.reviewOf(r)))
                .toList();
        return Map.of("data", data, "count", data.size());
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable UUID id) {
        AuthorizationRequest r = service.get(id);
        if (r == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found");
        return Map.of("data", RequestView.from(r, service.reviewOf(r)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@Valid @RequestBody CreateRequest body) {
        AuthorizationRequest r = service.create(body);
        return Map.of("data", RequestView.from(r, service.reviewOf(r)));
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable UUID id, @RequestBody CreateRequest body) {
        AuthorizationRequest r = service.update(id, body);
        if (r == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found");
        return Map.of("data", RequestView.from(r, service.reviewOf(r)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Map<String, Object>> action(@PathVariable UUID id, @RequestBody WorkflowAction body) {
        AuthorizationRequest r;
        if ("assign".equals(body.action())) {
            r = workflow.assignReviewer(id, body.reviewer());
        } else {
            WorkflowAction.Actor actor = body.actor() != null ? body.actor()
                    : new WorkflowAction.Actor("User", Role.PROVIDER);
            r = workflow.transition(id, body.to(), actor.name(), actor.role(), body.note());
        }
        return ResponseEntity.ok(Map.of("data", RequestView.from(r, service.reviewOf(r))));
    }
}
