package com.healthconn.healthcare_connector.payer.dto;

import com.healthconn.healthcare_connector.provider.entity.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequestDto {
    @NotNull
    private RequestStatus decision;
    private String reviewNotes;
    private String rejectionReason;
}
