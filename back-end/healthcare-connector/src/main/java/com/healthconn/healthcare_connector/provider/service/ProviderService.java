package com.healthconn.healthcare_connector.provider.service;

import com.healthconn.healthcare_connector.provider.dto.AuthRequestResponseDto;
import com.healthconn.healthcare_connector.provider.dto.SubmitRequestDto;

import java.util.List;

/**
 * Service interface for provider operations.
 */
public interface ProviderService {

    /**
     * Submit a new authorization request.
     *
     * @param dto Request details
     * @param providerId Logged-in provider ID
     * @return Created authorization request
     */
    AuthRequestResponseDto submitRequest(
            SubmitRequestDto dto,
            Long providerId
    );

    /**
     * Returns all authorization requests submitted
     * by the logged-in provider.
     *
     * @param providerId Provider ID
     * @return List of provider requests
     */
    List<AuthRequestResponseDto> getMyRequests(
            Long providerId
    );

}