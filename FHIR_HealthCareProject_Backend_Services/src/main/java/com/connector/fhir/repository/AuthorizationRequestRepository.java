package com.connector.fhir.repository;

import com.connector.fhir.model.AuthorizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequest, Long> {
    
    List<AuthorizationRequest> findByProviderId(Long providerId);
    
    @Query("SELECT r FROM AuthorizationRequest r WHERE r.status <> 'DRAFT'")
    List<AuthorizationRequest> findAllNonDraftRequests();
    
    List<AuthorizationRequest> findByStatusIn(List<String> statuses);
}
