package Smart_Health_Care.Smart_Health_Care.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import Smart_Health_Care.Smart_Health_Care.entity.AuthorizationRequest;
import Smart_Health_Care.Smart_Health_Care.repository.AuthorizationRepository;
import Smart_Health_Care.Smart_Health_Care.service.AuthorizationService;

@Service
public class AuthorizationServiceImpl implements AuthorizationService {

    private final AuthorizationRepository repository;

    public AuthorizationServiceImpl(AuthorizationRepository repository) {
        this.repository = repository;
    }

    @Override
    public AuthorizationRequest submitAuthorization(AuthorizationRequest request) {

        request.setStatus("PENDING");

        return repository.save(request);
    }

    @Override
    public List<AuthorizationRequest> getAllAuthorizations() {

        return repository.findAll();
    }

    @Override
    public AuthorizationRequest getAuthorizationById(Long id) {

        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Authorization Request Not Found"));
    }

    @Override
    public AuthorizationRequest approveAuthorization(Long id) {

        AuthorizationRequest request = getAuthorizationById(id);

        request.setStatus("APPROVED");
        request.setComments("Approved by Payer");

        return repository.save(request);
    }

    @Override
    public AuthorizationRequest rejectAuthorization(Long id, String comments) {

        AuthorizationRequest request = getAuthorizationById(id);

        request.setStatus("REJECTED");
        request.setComments(comments);

        return repository.save(request);
    }

    @Override
    public String getAuthorizationStatus(Long id) {

        AuthorizationRequest request = getAuthorizationById(id);

        return request.getStatus();
    }
}
