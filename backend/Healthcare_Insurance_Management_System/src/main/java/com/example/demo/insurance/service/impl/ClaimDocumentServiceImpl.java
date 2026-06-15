package com.example.demo.insurance.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.health_care.exception.exceptions.NotFoundException;
import com.example.demo.insurance.dto.ClaimDocumentDTO;
import com.example.demo.insurance.mapper.ClaimDocumentMapper;
import com.example.demo.insurance.model.Claim;
import com.example.demo.insurance.model.ClaimDocument;
import com.example.demo.insurance.repository.ClaimDocumentRepository;
import com.example.demo.insurance.repository.ClaimRepository;
import com.example.demo.insurance.service.ClaimDocumentService;

@Service
public class ClaimDocumentServiceImpl implements ClaimDocumentService {

    private final ClaimDocumentRepository repository;

    private final ClaimRepository claimRepository;

    public ClaimDocumentServiceImpl(ClaimDocumentRepository repository, ClaimRepository claimRepository) {
        this.repository = repository;
        this.claimRepository = claimRepository;
    }

    @Override
    @Transactional
    public ClaimDocumentDTO upload(UUID claimId, ClaimDocumentDTO request) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new NotFoundException("Claim not found for id=" + claimId));

        ClaimDocument entity = ClaimDocumentMapper.toEntity(request);
        entity.setClaim(claim);

        ClaimDocument saved = repository.save(entity);
        return ClaimDocumentMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimDocumentDTO> listByClaimId(UUID claimId) {
        return repository.findByClaimId(claimId).stream().map(ClaimDocumentMapper::toDto).toList();
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("ClaimDocument not found for id=" + id);
        }
        repository.deleteById(id);
    }
}
