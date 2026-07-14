package com.healthcare.authorization.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "authorization_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorizationRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long providerId;
    private Long payerId;

    @NotBlank
    private String patientId;

    @NotBlank
    private String procedureCode;

    @NotBlank
    private String diagnosisCode;

    private String clinicalNotes;

    @Enumerated(EnumType.STRING)
    private AuthorizationStatus status;

    private String payerRemarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
