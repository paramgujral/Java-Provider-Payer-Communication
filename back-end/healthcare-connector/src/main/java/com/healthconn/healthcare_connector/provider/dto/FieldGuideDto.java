package com.healthconn.healthcare_connector.provider.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FieldGuideDto {
    /** MISSING | WARNING | SUGGESTION */
    private String type;
    private String field;
    private String issue;
    private String expected;
}
