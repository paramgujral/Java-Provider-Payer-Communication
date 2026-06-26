package com.healthcare.connector.authorization.repository;

import com.healthcare.connector.authorization.entity.AuthorizationRequest;
import com.healthcare.connector.authorization.entity.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {
    List<StatusHistory> findByAuthorizationRequestOrderByChangedAtAsc(AuthorizationRequest request);
}
