package com.feuji.healthcare.ai.dto;

import com.feuji.healthcare.ai.enums.AiValidationStatus;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiValidationResponseDto {

    private AiValidationStatus status;

    private Integer riskScore;

    private List<String> recommendations;
}