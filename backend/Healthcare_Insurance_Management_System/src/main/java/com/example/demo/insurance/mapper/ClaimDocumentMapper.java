package com.example.demo.insurance.mapper;

import java.util.UUID;

import com.example.demo.insurance.dto.ClaimDocumentDTO;
import com.example.demo.insurance.model.Claim;
import com.example.demo.insurance.model.ClaimDocument;

public class ClaimDocumentMapper {

    private ClaimDocumentMapper() {
    }

    public static ClaimDocument toEntity(ClaimDocumentDTO dto) {
        if (dto == null) {
            return null;
        }

        ClaimDocument entity = new ClaimDocument();
        entity.setId(dto.getId());
        entity.setFileName(dto.getFileName());
        entity.setFilePath(dto.getFilePath());
        entity.setDocumentType(dto.getDocumentType());

        if (dto.getClaimId() != null) {
            Claim claim = new Claim();
            claim.setId(dto.getClaimId());
            entity.setClaim(claim);
        }

        return entity;
    }

    public static ClaimDocumentDTO toDto(ClaimDocument entity) {
        if (entity == null) {
            return null;
        }

        UUID claimId = entity.getClaim() != null ? entity.getClaim().getId() : null;

        return ClaimDocumentDTO.builder()
                .id(entity.getId())
                .fileName(entity.getFileName())
                .filePath(entity.getFilePath())
                .documentType(entity.getDocumentType())
                .claimId(claimId)
                .build();
    }
}
