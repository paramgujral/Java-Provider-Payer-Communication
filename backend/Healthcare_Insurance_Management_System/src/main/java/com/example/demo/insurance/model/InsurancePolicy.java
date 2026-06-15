package com.example.demo.insurance.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.demo.health_care.model.BaseEntity;
import com.example.demo.health_care.model.Patient;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "insurance_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsurancePolicy extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String policyNumber;

    @Column(nullable = false)
    private BigDecimal coverageAmount;

    private LocalDate startDate;

    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insurance_company_id")
    private InsuranceCompany insuranceCompany;
}