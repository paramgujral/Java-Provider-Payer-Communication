package com.feuji.healthcare.patient.repository;

import com.feuji.healthcare.patient.entity.PatientEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository
        extends JpaRepository<PatientEntity, Long> {

    boolean existsByPolicyNumber(String policyNumber);

    Optional<PatientEntity> findByPatientCode(String patientCode);
}
