package com.example.demo.insurance.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.ai_validation.model.AIValidation;
import com.example.demo.ai_validation.service.AIValidationService;
import com.example.demo.health_care.exception.exceptions.NotFoundException;
import com.example.demo.health_care.model.Disease;
import com.example.demo.health_care.model.Patient;
import com.example.demo.health_care.repository.DiseaseRepository;
import com.example.demo.health_care.repository.PatientRepository;
import com.example.demo.insurance.dto.ClaimDTO;
import com.example.demo.insurance.mapper.ClaimMapper;
import com.example.demo.insurance.model.Claim;
import com.example.demo.insurance.model.ClaimDocument;
import com.example.demo.insurance.model.InsurancePolicy;
import com.example.demo.insurance.repository.ClaimDocumentRepository;
import com.example.demo.insurance.repository.ClaimRepository;
import com.example.demo.insurance.repository.InsurancePolicyRepository;
import com.example.demo.insurance.service.ClaimService;
import com.example.demo.insurance.utils.ClaimStatus;
import com.example.demo.service.AuditLogService;

@Service
public class ClaimServiceImpl implements ClaimService {

    private final ClaimRepository repository;
    private final PatientRepository patientRepository;
    private final InsurancePolicyRepository policyRepository;
    private final DiseaseRepository diseaseRepository;
    private final ClaimDocumentRepository claimDocumentRepository;
    private final AIValidationService aiValidationService;
    private final AuditLogService auditLogService;

    public ClaimServiceImpl(
            ClaimRepository repository,
            PatientRepository patientRepository,
            InsurancePolicyRepository policyRepository,
            DiseaseRepository diseaseRepository,
            ClaimDocumentRepository claimDocumentRepository,
            AIValidationService aiValidationService,
            AuditLogService auditLogService) {
        this.repository = repository;
        this.patientRepository = patientRepository;
        this.policyRepository = policyRepository;
        this.diseaseRepository = diseaseRepository;
        this.claimDocumentRepository = claimDocumentRepository;
        this.aiValidationService = aiValidationService;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public ClaimDTO create(ClaimDTO request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new NotFoundException("Patient not found for id=" + request.getPatientId()));
        InsurancePolicy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new NotFoundException("Policy not found for id=" + request.getPolicyId()));
        Disease disease = diseaseRepository.findById(request.getDiseaseId())
                .orElseThrow(() -> new NotFoundException("Disease not found for id=" + request.getDiseaseId()));

        Claim claim = Claim.builder()
                .claimNumber("CLM-" + UUID.randomUUID())
                .requestedAmount(request.getAmount())
                .healthcareRemarks(request.getRemarks())
                .status(ClaimStatus.DRAFT)
                .patient(patient)
                .insurancePolicy(policy)
                .disease(disease)
                .build();

        Claim saved = repository.save(claim);
        auditLogService.create("Claim Created", "system", "Claim " + saved.getClaimNumber() + " created for patient " + patient.getId());
        return ClaimMapper.toDto(saved);
    }

    @Override
    @Transactional
    public ClaimDTO update(UUID id, ClaimDTO request) {
        Claim existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Claim not found for id=" + id));
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new NotFoundException("Patient not found for id=" + request.getPatientId()));
        InsurancePolicy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new NotFoundException("Policy not found for id=" + request.getPolicyId()));
        Disease disease = diseaseRepository.findById(request.getDiseaseId())
                .orElseThrow(() -> new NotFoundException("Disease not found for id=" + request.getDiseaseId()));

        existing.setPatient(patient);
        existing.setInsurancePolicy(policy);
        existing.setDisease(disease);
        existing.setRequestedAmount(request.getAmount());
        existing.setHealthcareRemarks(request.getRemarks());

        Claim saved = repository.save(existing);
        return ClaimMapper.toDto(saved);
    }

    @Override
    @Transactional
    public ClaimDTO submit(UUID id) {
        Claim existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Claim not found for id=" + id));

        existing.setStatus(ClaimStatus.UNDER_REVIEW);
        existing.setSubmittedAt(LocalDateTime.now());

        List<ClaimDocument> documents = claimDocumentRepository.findByClaimId(id);
        InsurancePolicy policy = existing.getInsurancePolicy();
        Disease disease = existing.getDisease();

        AIValidation validation = aiValidationService.validateAndPersist(
                existing, policy, disease, existing.getRequestedAmount(), documents);

        existing.setAiValidation(validation);
        Claim saved = repository.save(existing);
        ClaimDTO dto = ClaimMapper.toDto(saved);
        auditLogService.create("Claim Submitted", "system", "Claim " + saved.getClaimNumber() + " submitted for review");
        return dto;
    }

    @Override
    @Transactional
    public ClaimDTO approve(UUID id, BigDecimal approvedAmount, String insuranceRemarks) {
        Claim existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Claim not found for id=" + id));

        existing.setStatus(ClaimStatus.APPROVED);
        existing.setApprovedAmount(approvedAmount);
        existing.setInsuranceRemarks(insuranceRemarks);
        existing.setReviewedAt(LocalDateTime.now());

        Claim saved = repository.save(existing);
        auditLogService.create("Claim Approved", "system", "Claim " + saved.getClaimNumber() + " approved with amount " + approvedAmount);
        return ClaimMapper.toDto(saved);
    }

    @Override
    @Transactional
    public ClaimDTO reject(UUID id, String insuranceRemarks) {
        Claim existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Claim not found for id=" + id));

        existing.setStatus(ClaimStatus.REJECTED);
        existing.setInsuranceRemarks(insuranceRemarks);
        existing.setReviewedAt(LocalDateTime.now());

        Claim saved = repository.save(existing);
        auditLogService.create("Claim Rejected", "system", "Claim " + saved.getClaimNumber() + " rejected");
        return ClaimMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ClaimDTO getById(UUID id) {
        return repository.findById(id)
                .map(ClaimMapper::toDto)
                .orElseThrow(() -> new NotFoundException("Claim not found for id=" + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimDTO> listAll() {
        return repository.findAllWithAiValidation().stream().map(ClaimMapper::toDto).toList();
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Claim not found for id=" + id);
        }
        repository.deleteById(id);
    }
}
