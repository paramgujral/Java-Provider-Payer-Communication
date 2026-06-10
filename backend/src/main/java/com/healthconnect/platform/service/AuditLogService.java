package com.healthconnect.platform.service;

import com.healthconnect.platform.dto.response.AuditLogResponse;
import com.healthconnect.platform.entity.AuditLog;
import com.healthconnect.platform.entity.AuthorizationRequest;
import com.healthconnect.platform.entity.User;
import com.healthconnect.platform.enums.AuditAction;
import com.healthconnect.platform.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(AuthorizationRequest request, AuditAction action,
                    String description, User performedBy) {
        AuditLog log = AuditLog.builder()
                .authorizationRequest(request)
                .action(action)
                .description(description)
                .performedBy(performedBy)
                .performedByName(performedBy != null ? performedBy.getFullName() : "System")
                .performedByRole(performedBy != null ? performedBy.getRole().name() : "SYSTEM")
                .build();
        auditLogRepository.save(log);
    }

    public void log(AuthorizationRequest request, AuditAction action,
                    String description, String details, User performedBy) {
        AuditLog log = AuditLog.builder()
                .authorizationRequest(request)
                .action(action)
                .description(description)
                .details(details)
                .performedBy(performedBy)
                .performedByName(performedBy != null ? performedBy.getFullName() : "System")
                .performedByRole(performedBy != null ? performedBy.getRole().name() : "SYSTEM")
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLogResponse> getLogsForRequest(Long requestId) {
        return auditLogRepository.findByAuthorizationRequestIdOrderByCreatedAtAsc(requestId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .action(log.getAction())
                .actionDisplayName(log.getAction().getDisplayName())
                .description(log.getDescription())
                .details(log.getDetails())
                .performedByName(log.getPerformedByName())
                .performedByRole(log.getPerformedByRole())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
