package com.healthcare.connector.repository;

import com.healthcare.connector.model.AuthorizationCase;
import com.healthcare.connector.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorizationCaseRepository extends JpaRepository<AuthorizationCase, Long> {

    Optional<AuthorizationCase> findByCaseId(String caseId);

    List<AuthorizationCase> findByProviderOrderByCreatedAtDesc(User provider);

    List<AuthorizationCase> findByStatusNotOrderByUpdatedAtDesc(AuthorizationCase.CaseStatus status);

    List<AuthorizationCase> findAllByOrderByUpdatedAtDesc();

    @Query("SELECT a FROM AuthorizationCase a WHERE a.status != 'DRAFT' ORDER BY a.updatedAt DESC")
    List<AuthorizationCase> findAllSubmittedCases();

    @Query("SELECT COUNT(a) FROM AuthorizationCase a WHERE a.provider = :provider AND a.status = :status")
    long countByProviderAndStatus(User provider, AuthorizationCase.CaseStatus status);

    @Query("SELECT COUNT(a) FROM AuthorizationCase a WHERE a.status = :status")
    long countByStatus(AuthorizationCase.CaseStatus status);

    List<AuthorizationCase> findByStatus(AuthorizationCase.CaseStatus status);
}
