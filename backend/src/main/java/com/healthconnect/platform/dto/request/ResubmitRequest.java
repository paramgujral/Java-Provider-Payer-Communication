package com.healthconnect.platform.dto.request;

import lombok.Data;

@Data
public class ResubmitRequest {
    private String clinicalNotes;
    private String supportingDocuments;
    private String additionalInfo;
    private String diagnosisCode;
    private String diagnosisDescription;
    private String procedureCode;
    private String procedureDescription;
    private String facilityName;
    private String treatingPhysician;
}
