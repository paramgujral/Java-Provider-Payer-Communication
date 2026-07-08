package com.healthcare.connector.models;

import com.healthcare.connector.enums.ResponseStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "authorization_responses")
@Data
public class AuthorizationResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "request_id")
    private AuthorizationRequest request;

    @Column(unique = true, nullable = false)
    private String responseId;

    @Enumerated(EnumType.STRING)
    private ResponseStatus status;

    @CreationTimestamp
    private LocalDateTime decisionDate;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String fhirClaimResponseJson;

    private String notes;
}
