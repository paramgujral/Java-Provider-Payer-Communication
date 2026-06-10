package com.feignClient.Auth;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "authorization_requesttt")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Hospital sending the request
    private Long providerId;

    // Patient Information
    private String patientId;

    private String patientName;

    // Medical Details
    private String disease;

    private String treatment;

    // Workflow
    private String status;

    // Payer comments if rejected
    private String payerComments;
    
    private Integer aiScore;
    private String aiMessage;
}