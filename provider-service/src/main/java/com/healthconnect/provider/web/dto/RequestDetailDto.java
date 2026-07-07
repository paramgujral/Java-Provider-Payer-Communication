package com.healthconnect.provider.web.dto;

import com.healthconnect.provider.domain.AuthorizationRequest;
import com.healthconnect.provider.domain.StatusHistory;

import java.util.List;

/** Request plus its status history. */
public record RequestDetailDto(AuthorizationRequest request, List<StatusHistory> history) {
}
