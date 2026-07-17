package com.healthcare.fhir.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.healthcare.fhir.entity.FhirResourceEntity;

public interface FhirResourceRepository extends JpaRepository<FhirResourceEntity, String> {
}
