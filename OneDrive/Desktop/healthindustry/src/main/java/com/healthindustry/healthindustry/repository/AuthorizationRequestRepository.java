package com.healthindustry.healthindustry.repository;

import com.healthindustry.healthindustry.entity.AuthorizationRequest;
import com.healthindustry.healthindustry.entity.AuthorizationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuthorizationRequestRepository
        extends JpaRepository<AuthorizationRequest, Long> {

    List<AuthorizationRequest> findByStatus(
            AuthorizationStatus status);

    List<AuthorizationRequest>
    findByProviderIdAndNotifiedProviderFalse(
            Long providerId);

    List<AuthorizationRequest>
    findByProviderId(
            Long providerId);

    long countByProviderId(
            Long providerId);

    long countByProviderIdAndStatus(
            Long providerId,
            AuthorizationStatus status);

    // ADD THESE METHODS

    long countByStatus(
            AuthorizationStatus status);

    long count();
}