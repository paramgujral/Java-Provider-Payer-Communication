package com.healthindustry.healthindustry.dto;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationResponseDTO {

    private boolean isValid;

    private List<String> recommendations;
}