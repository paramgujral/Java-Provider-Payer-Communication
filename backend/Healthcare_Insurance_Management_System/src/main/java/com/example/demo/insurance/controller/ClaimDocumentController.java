package com.example.demo.insurance.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.insurance.dto.ClaimDocumentDTO;
import com.example.demo.insurance.service.ClaimDocumentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/claim-documents")
public class ClaimDocumentController {

    private final ClaimDocumentService service;

    public ClaimDocumentController(ClaimDocumentService service) {
        this.service = service;
    }

    @PostMapping("/claims/{claimId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ClaimDocumentDTO upload(@PathVariable UUID claimId, @RequestBody Map<String, String> request) {
        ClaimDocumentDTO dto = ClaimDocumentDTO.builder()
                .fileName(request.getOrDefault("fileName", ""))
                .filePath(request.getOrDefault("filePath", ""))
                .documentType(request.getOrDefault("documentType", "OTHER"))
                .claimId(claimId)
                .build();
        return service.upload(claimId, dto);
    }

    @GetMapping("/claims/{claimId}")
    public List<ClaimDocumentDTO> listByClaimId(@PathVariable UUID claimId) {
        return service.listByClaimId(claimId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
