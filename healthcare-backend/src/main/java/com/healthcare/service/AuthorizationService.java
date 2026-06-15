package com.healthcare.service;

import com.healthcare.dto.AiReviewResponse;
import com.healthcare.dto.AuthorizationRequestDto;
import com.healthcare.dto.CommunicationNoteDto;
import com.healthcare.entity.AuditLog;
import com.healthcare.entity.AuthorizationRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import reactor.core.publisher.Mono;

import java.util.List;

public interface AuthorizationService {

    AuthorizationRequest createRequest(AuthorizationRequestDto dto);

    AuthorizationRequest getRequestById(String id);

    Page<AuthorizationRequest> getRequestsByProvider(String providerId, Pageable pageable);

    Page<AuthorizationRequest> getRequestsByPayer(String payerId, Pageable pageable);

    AuthorizationRequest updateStatus(String id, AuthorizationRequest.RequestStatus newStatus);

    /** Bidirectional: Add a communication note from Provider or Payer */
    AuthorizationRequest addCommunicationNote(String id, CommunicationNoteDto noteDto);

    /** Get audit trail for a specific authorization request */
    List<AuditLog> getAuditTrail(String authorizationRequestId);

    /** Runs AI Adjudication for a payer */
    Mono<AiReviewResponse> adjudicateRequest(String id);
}
