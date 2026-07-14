package com.feuji.healthcare_connector.repository;

import com.feuji.healthcare_connector.entity.AuthorizationRequest;
import com.feuji.healthcare_connector.entity.User;
import com.feuji.healthcare_connector.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequest, Long> {
    
    // Lists and Pagination
    @EntityGraph(attributePaths = {"provider", "payer"})
    Page<AuthorizationRequest> findAllByProvider(User provider, Pageable pageable);
    
    @EntityGraph(attributePaths = {"provider", "payer"})
    Page<AuthorizationRequest> findAllByPayer(User payer, Pageable pageable);
    
    @EntityGraph(attributePaths = {"provider", "payer"})
    List<AuthorizationRequest> findAllByProviderOrderByCreatedAtDesc(User provider);
    
    @EntityGraph(attributePaths = {"provider", "payer"})
    List<AuthorizationRequest> findAllByPayerOrderByCreatedAtDesc(User payer);
    
    // Dashboard Stats for Provider
    long countByProvider(User provider);
    long countByProviderAndStatus(User provider, RequestStatus status);
    
    // Dashboard Stats for Payer
    long countByPayer(User payer);
    long countByPayerAndStatus(User payer, RequestStatus status);
    long countByPayerAndStatusAndUpdatedAtAfter(User payer, RequestStatus status, LocalDateTime dateTime);
}
