package com.example.demo.insurance.service;

import java.util.List;
import java.util.UUID;

import com.example.demo.insurance.dto.ClaimDocumentDTO;

public interface ClaimDocumentService {

    ClaimDocumentDTO upload(UUID claimId, ClaimDocumentDTO request);

    List<ClaimDocumentDTO> listByClaimId(UUID claimId);

    void delete(UUID id);
}
