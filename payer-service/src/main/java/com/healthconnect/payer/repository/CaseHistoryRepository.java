package com.healthconnect.payer.repository;

import com.healthconnect.payer.domain.CaseHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CaseHistoryRepository extends JpaRepository<CaseHistory, Long> {

    List<CaseHistory> findByCaseIdOrderByOccurredAtAsc(Long caseId);
}
