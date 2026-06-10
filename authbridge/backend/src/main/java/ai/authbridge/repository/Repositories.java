package ai.authbridge.repository;

import ai.authbridge.domain.AuthorizationRequest;
import ai.authbridge.domain.Enums.RequestStatus;
import ai.authbridge.domain.Enums.Role;
import ai.authbridge.domain.NotificationEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data JPA repositories. Co-located for brevity; split per aggregate in production. */
public final class Repositories {
    private Repositories() {}

    public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequest, UUID> {
        Optional<AuthorizationRequest> findByReferenceNo(String referenceNo);
        List<AuthorizationRequest> findByStatusOrderByUpdatedAtDesc(RequestStatus status);
        List<AuthorizationRequest> findByPayerOrgOrderByUpdatedAtDesc(String payerOrg);
        List<AuthorizationRequest> findByProviderOrgOrderByUpdatedAtDesc(String providerOrg);
        long countByStatus(RequestStatus status);
    }

    public interface NotificationRepository extends JpaRepository<NotificationEntity, UUID> {
        List<NotificationEntity> findByRoleOrderByCreatedAtDesc(Role role);
        long countByRoleAndReadIsFalse(Role role);
    }
}
