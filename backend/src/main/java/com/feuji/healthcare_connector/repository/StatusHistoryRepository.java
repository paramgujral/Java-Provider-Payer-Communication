package com.feuji.healthcare_connector.repository;

import com.feuji.healthcare_connector.entity.StatusHistory;
import com.feuji.healthcare_connector.entity.AuthorizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {
    List<StatusHistory> findByRequestOrderByChangedAtAsc(AuthorizationRequest request);
    List<StatusHistory> findAllByRequestIdOrderByChangedAtAsc(Long requestId);
}
