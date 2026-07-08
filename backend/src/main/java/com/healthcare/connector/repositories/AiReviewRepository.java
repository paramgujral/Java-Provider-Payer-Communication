package com.healthcare.connector.repositories;

import com.healthcare.connector.models.AiReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AiReviewRepository extends JpaRepository<AiReview, Long> {
    Optional<AiReview> findByRequestId(Long requestId);
}
