package com.feuji.healthcare.authorization.entity;

import com.feuji.healthcare.authorization.enums.AuthorizationStatus;
import com.feuji.healthcare.common.entity.AuditEntity;
import com.feuji.healthcare.patient.entity.PatientEntity;
import com.feuji.healthcare.payer.entity.PayerEntity;
import com.feuji.healthcare.provider.entity.ProviderEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "authorization_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorizationRequestEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String requestNumber;

    @ManyToOne
    @JoinColumn(name = "provider_id")
    private ProviderEntity provider;

    @ManyToOne
    @JoinColumn(name = "payer_id")
    private PayerEntity payer;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private PatientEntity patient;

    private String diagnosis;

    private String procedureCode;

    private BigDecimal requestedAmount;

    @Enumerated(EnumType.STRING)
    private AuthorizationStatus status;

    @Column(length = 1000)
    private String rejectionReason;
}
