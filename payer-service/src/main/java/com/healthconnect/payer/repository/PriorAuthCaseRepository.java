package com.healthconnect.payer.repository;

import com.healthconnect.common.model.AuthorizationStatus;
import com.healthconnect.payer.domain.PriorAuthCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PriorAuthCaseRepository extends JpaRepository<PriorAuthCase, Long> {

    Optional<PriorAuthCase> findByRequestNumber(String requestNumber);

    List<PriorAuthCase> findByStatusOrderByReceivedAtAsc(AuthorizationStatus status);

    List<PriorAuthCase> findAllByOrderByUpdatedAtDesc();
}
