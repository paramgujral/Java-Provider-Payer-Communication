package Smart_Health_Care.Smart_Health_Care.service;

import java.util.List;

import Smart_Health_Care.Smart_Health_Care.entity.AuthorizationRequest;

public interface AuthorizationService {

    // Submit a new authorization request
    AuthorizationRequest submitAuthorization(AuthorizationRequest request);

    // Get all authorization requests
    List<AuthorizationRequest> getAllAuthorizations();

    // Get authorization by ID
    AuthorizationRequest getAuthorizationById(Long id);

    // Approve authorization request
    AuthorizationRequest approveAuthorization(Long id);

    // Reject authorization request
    AuthorizationRequest rejectAuthorization(Long id, String comments);

	String getAuthorizationStatus(Long id);
}