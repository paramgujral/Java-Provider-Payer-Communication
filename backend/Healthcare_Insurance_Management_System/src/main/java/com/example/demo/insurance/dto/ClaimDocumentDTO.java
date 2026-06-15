package com.example.demo.insurance.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimDocumentDTO {

    private UUID id;

    @NotBlank(message = "fileName is required")
    private String fileName;

    @NotBlank(message = "filePath is required")
    private String filePath;

    @NotBlank(message = "documentType is required")
    private String documentType;

    private UUID claimId;
}
