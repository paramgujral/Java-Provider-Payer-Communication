package Smart_Health_Care.Smart_Health_Care.controller;


import java.util.List;

import org.springframework.web.bind.annotation.*;

import Smart_Health_Care.Smart_Health_Care.dto.RejectAuthorizationRequest;
import Smart_Health_Care.Smart_Health_Care.entity.AuthorizationRequest;
import Smart_Health_Care.Smart_Health_Care.service.AuthorizationService;

@RestController
@RequestMapping("/authorization")
public class AuthorizationRequestController {

    private final AuthorizationService service;

    public AuthorizationRequestController(AuthorizationService service) {
        this.service = service;
    }

    // Submit Authorization Request
    @PostMapping
    public AuthorizationRequest submitAuthorization(
            @RequestBody AuthorizationRequest request) {

        return service.submitAuthorization(request);
    }

    // Get All Authorization Requests
    @GetMapping
    public List<AuthorizationRequest> getAllAuthorizations() {

        return service.getAllAuthorizations();
    }

    // Get Authorization Request by ID
    @GetMapping("/{id}")
    public AuthorizationRequest getAuthorizationById(
            @PathVariable Long id) {

        return service.getAuthorizationById(id);
    }

    // Approve Authorization Request
    @PostMapping("/{id}/approve")
    public AuthorizationRequest approveAuthorization(
            @PathVariable Long id) {

        return service.approveAuthorization(id);
    }

    // Reject Authorization Request
    @PostMapping("/{id}/reject")
    public AuthorizationRequest rejectAuthorization(
            @PathVariable Long id,
            @RequestBody RejectAuthorizationRequest request) {

        return service.rejectAuthorization(id, request.getComments());
    }

    // Get Authorization Status
    @GetMapping("/{id}/status")
    public String getAuthorizationStatus(
            @PathVariable Long id) {

        return service.getAuthorizationStatus(id);
    }

}
