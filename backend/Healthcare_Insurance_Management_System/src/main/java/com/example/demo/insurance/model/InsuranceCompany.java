package com.example.demo.insurance.model;

import com.example.demo.health_care.model.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "insurance_companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsuranceCompany extends BaseEntity {

    @Column(nullable = false)
    private String companyName;

    private String email;

    private String phone;

    private String address;

    private boolean active = true;
}
