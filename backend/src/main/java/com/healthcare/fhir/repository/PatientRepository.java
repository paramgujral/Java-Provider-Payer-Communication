package com.healthcare.fhir.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.healthcare.fhir.entity.PatientEntity;

@Repository
public interface PatientRepository extends JpaRepository<PatientEntity, String> {

}
