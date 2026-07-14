package com.healthconn.healthcare_connector.provider.repository;

import com.healthconn.healthcare_connector.provider.entity.AuthorizationRequest;
import com.healthconn.healthcare_connector.provider.entity.Priority;
import com.healthconn.healthcare_connector.provider.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequest, Long> {

    // ==========================================================
    // Provider Requests
    // ==========================================================

    List<AuthorizationRequest> findByProviderIdOrderByCreatedAtDesc(
            Long providerId
    );

    // ==========================================================
    // Pending Requests (Submitted + Under Review)
    // ==========================================================

    List<AuthorizationRequest> findByStatusInOrderByCreatedAtDesc(
            List<RequestStatus> statuses
    );

    // ==========================================================
    // Dashboard - All Requests
    // ==========================================================

    List<AuthorizationRequest> findAllByOrderByCreatedAtDesc();

    // ==========================================================
    // Requests Reviewed By Payer
    // ==========================================================

    List<AuthorizationRequest> findByReviewedByIdOrderByReviewedAtDesc(
            Long reviewedById
    );

    // ==========================================================
    // Dashboard Statistics
    // ==========================================================

    long countByStatus(RequestStatus status);

    long countByPriorityAndCreatedAtBetween(
            Priority priority,
            LocalDateTime start,
            LocalDateTime end
    );

}