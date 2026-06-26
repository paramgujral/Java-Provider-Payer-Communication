package com.healthcare.payer.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payer_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayerRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long providerRequestId;

    private String providerName;

    private String patientName;

    private String insuranceId;

    private String diagnosisCode;

    private String procedureCode;

    @Column(length = 3000)
    private String clinicalNotes;

    private String status;

    private String comments;
}