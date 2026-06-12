package com.healthindustry.healthindustry.entity;
import jakarta.persistence.*;
import lombok.*;
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

    private String patientName;

    private String insuranceId;

    @Column(length = 1000)
    private String diagnosisCodes;

    @Column(length = 1000)
    private String procedureCodes;

    @Enumerated(EnumType.STRING)
    private AuthorizationStatus status;

    @Column(length = 2000)
    private String aiValidationNotes;

    private boolean notifiedProvider;
}
