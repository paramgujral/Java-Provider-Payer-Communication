package com.example.healthcareconnector.repository;

import com.example.healthcareconnector.entity.AuthorizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthorizationRepository extends JpaRepository<AuthorizationRequest, Long> {

}
