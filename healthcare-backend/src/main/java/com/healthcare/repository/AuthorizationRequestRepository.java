package com.healthcare.repository;

import com.healthcare.entity.AuthorizationRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuthorizationRequestRepository extends MongoRepository<AuthorizationRequest, String> {
    Page<AuthorizationRequest> findByProviderId(String providerId, Pageable pageable);
    List<AuthorizationRequest> findByProviderId(String providerId);
    
    Page<AuthorizationRequest> findByPayerId(String payerId, Pageable pageable);
    List<AuthorizationRequest> findByPayerId(String payerId);
    
    Page<AuthorizationRequest> findByStatus(AuthorizationRequest.RequestStatus status, Pageable pageable);
}
