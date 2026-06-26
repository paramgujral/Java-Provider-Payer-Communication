package com.connector.fhir.repository;

import com.connector.fhir.model.Coverage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface CoverageRepository extends JpaRepository<Coverage, Long> {
    Optional<Coverage> findByFhirId(String fhirId);
    List<Coverage> findByPatientId(Long patientId);
}
