package com.feuji.healthcare.fhir.standard.patient;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelecomDto {

    private String system;
    private String value;
}