package com.healthcare.connector.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "authorization_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---------------- Patient Information ----------------

    private String patientFirstName;

    private String patientLastName;

    private String dateOfBirth;

    private String gender;

    private String mobileNumber;

    private String email;

    // ---------------- Insurance Information ----------------

    private String insuranceId;

    private String insuranceCompany;

    private String memberId;

    private String policyNumber;

    private String groupNumber;

    // ---------------- Provider Information ----------------

    private String providerName;

    private String providerNpi;

    private String providerAddress;

    // ---------------- Medical Information ----------------

    private String diagnosis;

    private String diagnosisCode;

    private String procedureName;

    private String procedureCode;

    private String priority;

    // ---------------- Authorization ----------------

    private String requestedDate;

    private String expectedServiceDate;

    @Column(length = 3000)
    private String clinicalNotes;

    // ---------------- Workflow ----------------

    private String status;
    @Column(columnDefinition = "LONGTEXT")
    private String aiReview;

    @Column(columnDefinition = "LONGTEXT")
    private String fhirJson;
}