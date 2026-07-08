package com.feuji.healthcare.communication.service;

import com.feuji.healthcare.communication.dto.*;

import java.util.List;

public interface CommunicationService {

    CommunicationResponseDto addComment(
            CommunicationRequestDto request);

    List<CommunicationResponseDto>
    getComments(Long authorizationId);
}