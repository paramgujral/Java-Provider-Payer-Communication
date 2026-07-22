package com.healthconn.healthcare_connector.provider.entity;


import com.healthconn.healthcare_connector.authentication.entity.User;
import javax.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "provider_requests")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthorizationRequest {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private String patientName;
    @Column(nullable = false) private String patientId;
    @Column(nullable = false) private String insuranceId;
    @Column(nullable = false) private String diagnosisCode;
    @Column(nullable = false) private String procedureCode;
    @Column(length = 1000)    private String treatmentDescription;

    private LocalDate admissionDate;
    private LocalDate expectedDischargeDate;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    @Builder.Default private Priority priority = Priority.NORMAL;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    @Builder.Default private RequestStatus status = RequestStatus.SUBMITTED;

    @Column(length = 1000) private String rejectionReason;
    @Column(length = 1000) private String reviewNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(updatable = false) @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
    private LocalDateTime reviewedAt;

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }
}