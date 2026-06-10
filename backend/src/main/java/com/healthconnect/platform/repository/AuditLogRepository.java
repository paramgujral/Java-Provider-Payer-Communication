package com.healthconnect.platform.repository;

import com.healthconnect.platform.entity.AuditLog;
import com.healthconnect.platform.entity.AuthorizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByAuthorizationRequestOrderByCreatedAtAsc(AuthorizationRequest request);

    List<AuditLog> findByAuthorizationRequestIdOrderByCreatedAtAsc(Long requestId);
}
