package com.example.demo.insurance.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.insurance.model.Claim;
import com.example.demo.insurance.utils.ClaimStatus;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, UUID> {

	long countByStatus(ClaimStatus status);

	@Query("SELECT COALESCE(AVG(c.requestedAmount), 0) FROM Claim c")
	BigDecimal findAverageClaimAmount();

	@Query("SELECT c FROM Claim c LEFT JOIN FETCH c.aiValidation WHERE c.status IN :statuses")
	List<Claim> findByStatusIn(@Param("statuses") List<ClaimStatus> statuses);

	@Query("SELECT c FROM Claim c LEFT JOIN FETCH c.aiValidation")
	List<Claim> findAllWithAiValidation();
}
