package com.healthconn.healthcare_connector.payer.service;

import com.healthconn.healthcare_connector.payer.dto.ReviewRequestDto;
import com.healthconn.healthcare_connector.provider.dto.AuthRequestResponseDto;

import java.util.List;

/**
 * Service interface for payer operations.
 */
public interface PayerService {

    /**
     * Returns all pending authorization requests.
     *
     * @return list of pending requests
     */
    List<AuthRequestResponseDto> getPendingRequests();

    /**
     * Approves or rejects an authorization request.
     *
     * @param requestId Authorization request ID
     * @param dto Review details
     * @param payerId Logged-in payer ID
     * @return Updated authorization request
     */
    AuthRequestResponseDto reviewRequest(
            Long requestId,
            ReviewRequestDto dto,
            Long payerId
    );

    /**
     * Returns all authorization requests.
     *
     * @return list of all requests
     */
    List<AuthRequestResponseDto> getAllRequests();

}