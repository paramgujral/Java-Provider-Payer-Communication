package com.healthcare.authorization.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.healthcare.authorization.entity.AuthorizationRequest;

public interface AuthorizationRepository extends JpaRepository<AuthorizationRequest, Long> {
	Optional<AuthorizationRequest> findTopByRequestNumberOrderByUpdatedAtDesc(String requestNumber);

	List<AuthorizationRequest> findAllByOrderByUpdatedAtDesc();

	List<AuthorizationRequest> findByStatusOrderByUpdatedAtDesc(String status);

	@Query("""
			select
				ar.id as id,
				ar.requestNumber as requestNumber,
				ar.providerId as providerId,
				ar.payerId as payerId,
				ar.patientName as patientName,
				ar.patientDob as patientDob,
				ar.patientGender as patientGender,
				ar.patientPhone as patientPhone,
				ar.patientAddress as patientAddress,
				ar.insuranceCompany as insuranceCompany,
				ar.policyNumber as policyNumber,
				ar.memberId as memberId,
				ar.coverageType as coverageType,
				ar.doctorName as doctorName,
				ar.npiNumber as npiNumber,
				ar.hospital as hospital,
				ar.specialty as specialty,
				ar.diagnosis as diagnosis,
				ar.icd10Code as icd10Code,
				ar.procedureName as procedureName,
				ar.cptCode as cptCode,
				ar.reasonForAuthorization as reasonForAuthorization,
				ar.mriReport as mriReport,
				ar.labReport as labReport,
				ar.prescription as prescription,
				ar.medicalHistory as medicalHistory,
				ar.status as status,
				ar.fhirValid as fhirValid,
				ar.aiScore as aiScore,
				ar.aiMissingJson as aiMissingJson,
				ar.aiWarningsJson as aiWarningsJson,
				ar.decisionReason as decisionReason,
				ar.submittedAt as submittedAt,
				ar.updatedAt as updatedAt
			from AuthorizationRequest ar
			order by ar.updatedAt desc
			""")
	List<AuthorizationUiProjection> findAllForUi();

	@Query("""
			select
				ar.id as id,
				ar.requestNumber as requestNumber,
				ar.providerId as providerId,
				ar.payerId as payerId,
				ar.patientName as patientName,
				ar.patientDob as patientDob,
				ar.patientGender as patientGender,
				ar.patientPhone as patientPhone,
				ar.patientAddress as patientAddress,
				ar.insuranceCompany as insuranceCompany,
				ar.policyNumber as policyNumber,
				ar.memberId as memberId,
				ar.coverageType as coverageType,
				ar.doctorName as doctorName,
				ar.npiNumber as npiNumber,
				ar.hospital as hospital,
				ar.specialty as specialty,
				ar.diagnosis as diagnosis,
				ar.icd10Code as icd10Code,
				ar.procedureName as procedureName,
				ar.cptCode as cptCode,
				ar.reasonForAuthorization as reasonForAuthorization,
				ar.mriReport as mriReport,
				ar.labReport as labReport,
				ar.prescription as prescription,
				ar.medicalHistory as medicalHistory,
				ar.status as status,
				ar.fhirValid as fhirValid,
				ar.aiScore as aiScore,
				ar.aiMissingJson as aiMissingJson,
				ar.aiWarningsJson as aiWarningsJson,
				ar.decisionReason as decisionReason,
				ar.submittedAt as submittedAt,
				ar.updatedAt as updatedAt
			from AuthorizationRequest ar
			where ar.id = :id
			""")
	Optional<AuthorizationUiProjection> findForUiById(@Param("id") Long id);
}
