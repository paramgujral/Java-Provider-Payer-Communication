package com.healthconnect.provider.repository;

import com.healthconnect.provider.domain.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

    List<StatusHistory> findByRequestIdOrderByOccurredAtAsc(Long requestId);
}
