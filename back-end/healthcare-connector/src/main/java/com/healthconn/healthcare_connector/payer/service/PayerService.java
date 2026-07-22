package com.healthconn.healthcare_connector.payer.service;


import com.healthconn.healthcare_connector.payer.dto.ReviewRequestDto;
import com.healthconn.healthcare_connector.provider.dto.AuthRequestResponseDto;
import java.util.List;

public interface PayerService {
    List<AuthRequestResponseDto> getReviewQueue();
    AuthRequestResponseDto updateRequestReview(Long requestId, ReviewRequestDto dto, Long payerId);
    List<AuthRequestResponseDto> getRequestHistory();
}