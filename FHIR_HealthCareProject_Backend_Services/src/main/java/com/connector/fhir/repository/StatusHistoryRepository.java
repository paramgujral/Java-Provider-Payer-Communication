package com.connector.fhir.repository;

import com.connector.fhir.model.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {
    List<StatusHistory> findByRequestIdOrderByCreatedAtAsc(Long requestId);
}
