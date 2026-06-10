package com.healthconnect.platform.dto.response;

import com.healthconnect.platform.enums.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private AuditAction action;
    private String actionDisplayName;
    private String description;
    private String details;
    private String performedByName;
    private String performedByRole;
    private LocalDateTime createdAt;
}
