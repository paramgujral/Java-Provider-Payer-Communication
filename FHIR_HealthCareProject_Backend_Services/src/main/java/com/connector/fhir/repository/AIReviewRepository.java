package com.connector.fhir.repository;

import com.connector.fhir.model.AIReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AIReviewRepository extends JpaRepository<AIReview, Long> {
    Optional<AIReview> findByRequestId(Long requestId);
}
