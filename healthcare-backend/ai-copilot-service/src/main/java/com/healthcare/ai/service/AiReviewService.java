package com.healthcare.ai.service;

import com.healthcare.ai.entity.AiReview;
import java.util.Map;

public interface AiReviewService {
    AiReview review(Map<String, String> request);
    AiReview getById(Long id);
}
