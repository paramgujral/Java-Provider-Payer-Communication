package com.feuji.healthcare_connector.repository;

import com.feuji.healthcare_connector.entity.AuthorizationCommunication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuthorizationCommunicationRepository extends JpaRepository<AuthorizationCommunication, Long> {

    List<AuthorizationCommunication> findByAuthorizationRequestIdOrderByCreatedAtDesc(Long authorizationRequestId);

    List<AuthorizationCommunication> findAllByOrderByCreatedAtDesc();
}