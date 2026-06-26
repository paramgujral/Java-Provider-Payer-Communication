package com.healthcare.connector.authorization.repository;

import com.healthcare.connector.auth.entity.User;
import com.healthcare.connector.authorization.entity.AuthorizationRequest;
import com.healthcare.connector.authorization.enums.AuthorizationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequest, Long> {

        Optional<AuthorizationRequest> findByReferenceNumber(String referenceNumber);

        Page<AuthorizationRequest> findByProvider(User provider, Pageable pageable);

        Page<AuthorizationRequest> findByPayer(User payer, Pageable pageable);

        Page<AuthorizationRequest> findByProviderAndStatus(User provider, AuthorizationStatus status,
                        Pageable pageable);

        Page<AuthorizationRequest> findByPayerAndStatus(User payer, AuthorizationStatus status, Pageable pageable);

        List<AuthorizationRequest> findByStatusIn(List<AuthorizationStatus> statuses);

        @Query("SELECT a FROM AuthorizationRequest a WHERE a.provider = :provider AND " +
                        "(LOWER(a.patientName) LIKE LOWER(CONCAT('%',:query,'%')) OR " +
                        "LOWER(a.referenceNumber) LIKE LOWER(CONCAT('%',:query,'%')) OR " +
                        "LOWER(a.diagnosisCode) LIKE LOWER(CONCAT('%',:query,'%')))")
        Page<AuthorizationRequest> searchByProvider(@Param("provider") User provider,
                        @Param("query") String query,
                        Pageable pageable);

        @Query("SELECT a FROM AuthorizationRequest a WHERE a.payer = :payer AND " +
                        "(LOWER(a.patientName) LIKE LOWER(CONCAT('%',:query,'%')) OR " +
                        "LOWER(a.referenceNumber) LIKE LOWER(CONCAT('%',:query,'%')) OR " +
                        "LOWER(a.procedureCode) LIKE LOWER(CONCAT('%',:query,'%')))")
        Page<AuthorizationRequest> searchByPayer(@Param("payer") User payer,
                        @Param("query") String query,
                        Pageable pageable);

        @Query("SELECT COUNT(a) FROM AuthorizationRequest a WHERE a.provider = :provider AND a.status = :status")
        Long countByProviderAndStatus(@Param("provider") User provider, @Param("status") AuthorizationStatus status);

        @Query("SELECT COUNT(a) FROM AuthorizationRequest a WHERE a.payer = :payer AND a.status = :status")
        Long countByPayerAndStatus(@Param("payer") User payer, @Param("status") AuthorizationStatus status);

        @Query("SELECT a FROM AuthorizationRequest a WHERE a.expiresAt <= CURRENT_DATE AND a.status NOT IN ('APPROVED','DENIED','CANCELLED','EXPIRED')")
        List<AuthorizationRequest> findExpiredRequests();
}
