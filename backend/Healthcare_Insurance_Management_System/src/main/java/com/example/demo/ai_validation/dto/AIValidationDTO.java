package com.example.demo.ai_validation.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIValidationDTO {

    private UUID id;

    private UUID claimId;

    private Integer score;

    private String result;

    private String remarks;

    private LocalDateTime validatedAt;
}
