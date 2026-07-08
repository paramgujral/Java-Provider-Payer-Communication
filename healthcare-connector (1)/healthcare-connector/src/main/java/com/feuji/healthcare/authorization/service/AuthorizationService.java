package com.feuji.healthcare.authorization.service;

import com.feuji.healthcare.authorization.dto.ApprovalRequestDto;
import com.feuji.healthcare.authorization.dto.AuthorizationRequestDto;
import com.feuji.healthcare.authorization.dto.AuthorizationResponseDto;

import java.util.List;

public interface AuthorizationService {

    AuthorizationResponseDto createRequest(
            AuthorizationRequestDto request);

    List<AuthorizationResponseDto> getAllRequests();

    AuthorizationResponseDto getRequestById(Long id);

    AuthorizationResponseDto markUnderReview(Long id);

    AuthorizationResponseDto approveRequest(Long id);

    AuthorizationResponseDto rejectRequest(
            Long id,
            ApprovalRequestDto request);

    AuthorizationResponseDto requestClarification(
            Long authorizationId,
            String message);

    AuthorizationResponseDto provideClarification(
            Long authorizationId,
            String response);
}
