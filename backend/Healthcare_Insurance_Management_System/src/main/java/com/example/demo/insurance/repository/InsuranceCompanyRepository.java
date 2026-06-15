package com.example.demo.insurance.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.insurance.model.InsuranceCompany;

public interface InsuranceCompanyRepository extends JpaRepository<InsuranceCompany, UUID> {
}

