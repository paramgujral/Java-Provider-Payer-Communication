package com.sana.healthcareconnector.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class ClaimDTO {
    private String patientName;
    private String diagnosis;
    private String treatment;
    private Long payerId;

}
