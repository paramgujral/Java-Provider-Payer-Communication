package com.healthcare.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Immutable audit trail for every action performed on an authorization request.
 * Critical for HIPAA compliance and traceability.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "audit_logs")
public class AuditLog {
    @Id
    private String id;

    @Indexed
    private String authorizationRequestId;

    private String performedBy;          // userId or organizationId
    private String action;               // CREATE, UPDATE_STATUS, ADD_NOTE, AI_REVIEW
    private String previousStatus;       // nullable for CREATE
    private String newStatus;
    private String details;              // human readable description

    @CreatedDate
    private Instant timestamp;
}
