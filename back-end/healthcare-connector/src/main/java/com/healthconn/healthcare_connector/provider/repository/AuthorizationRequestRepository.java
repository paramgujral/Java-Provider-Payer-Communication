package com.healthconn.healthcare_connector.provider.repository;

import com.healthconn.healthcare_connector.provider.entity.AuthorizationRequest;
import com.healthconn.healthcare_connector.provider.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.healthconn.healthcare_connector.provider.entity.Priority;
import java.time.LocalDateTime;

public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequest, Long> {
    List<AuthorizationRequest> findByProviderIdOrderByCreatedAtDesc(Long providerId);
    List<AuthorizationRequest> findByStatusInOrderByCreatedAtDesc(List<RequestStatus> statuses);
    List<AuthorizationRequest> findAllByOrderByCreatedAtDesc();
    List<AuthorizationRequest> findByReviewedByIdOrderByReviewedAtDesc(Long reviewedById);

    long countByStatus(RequestStatus status);

    long countByPriorityAndCreatedAtBetween(
            Priority priority,
            LocalDateTime start,
            LocalDateTime end
    );
}