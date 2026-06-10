package com.healthconnect.platform.repository;

import com.healthconnect.platform.entity.AuthorizationRequest;
import com.healthconnect.platform.entity.User;
import com.healthconnect.platform.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequest, Long> {

    Optional<AuthorizationRequest> findByReferenceNumber(String referenceNumber);

    // Provider queries
    List<AuthorizationRequest> findByProviderOrderByCreatedAtDesc(User provider);
    List<AuthorizationRequest> findByProviderAndStatusOrderByCreatedAtDesc(User provider, RequestStatus status);

    @Query("SELECT r FROM AuthorizationRequest r WHERE r.provider = :provider " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:search IS NULL OR LOWER(r.patientName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(r.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')))" +
           "ORDER BY r.createdAt DESC")
    List<AuthorizationRequest> findByProviderWithFilters(
            @Param("provider") User provider,
            @Param("status") RequestStatus status,
            @Param("search") String search);

    // Payer queries
    List<AuthorizationRequest> findByStatusOrderByCreatedAtAsc(RequestStatus status);

    List<AuthorizationRequest> findByStatusInOrderByCreatedAtAsc(List<RequestStatus> statuses);

    @Query("SELECT r FROM AuthorizationRequest r WHERE r.reviewer = :reviewer " +
           "AND r.resolvedAt >= :since ORDER BY r.resolvedAt DESC")
    List<AuthorizationRequest> findResolvedTodayByReviewer(
            @Param("reviewer") User reviewer,
            @Param("since") LocalDateTime since);

    @Query("SELECT r FROM AuthorizationRequest r WHERE r.resolvedAt >= :since")
    List<AuthorizationRequest> findAllResolvedSince(@Param("since") LocalDateTime since);

    // Dashboard counts - provider
    long countByProvider(User provider);
    long countByProviderAndStatus(User provider, RequestStatus status);

    // Dashboard counts - payer
    long countByStatus(RequestStatus status);
    long countByStatusIn(List<RequestStatus> statuses);

    @Query("SELECT r FROM AuthorizationRequest r WHERE " +
           "(:status IS NULL OR r.status = :status) " +
           "AND (:search IS NULL OR LOWER(r.patientName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(r.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')))" +
           "ORDER BY r.createdAt ASC")
    List<AuthorizationRequest> findPayerQueueWithFilters(
            @Param("status") RequestStatus status,
            @Param("search") String search);

    // Sequence for reference number generation
    @Query("SELECT COUNT(r) FROM AuthorizationRequest r WHERE YEAR(r.createdAt) = :year")
    long countByYear(@Param("year") int year);
}
