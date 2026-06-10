package com.example.demo.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String patientName;

    private String diagnosis;

    private String procedureName;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    private String payerRemarks;

    @Column(name = "ai_review_notes", columnDefinition = "TEXT")
    private String aiReviewNotes;

    @Column(name = "ai_review_passed")
    private Boolean aiReviewPassed;

    @ManyToOne
    @JoinColumn(name = "provider_id")
    private Provider provider;

    @ManyToOne
    @JoinColumn(name = "payer_id")
    private Payer payer;
}
