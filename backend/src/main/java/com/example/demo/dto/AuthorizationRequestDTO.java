package com.example.demo.dto;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.Objects;
@Getter
@Setter
@Data
public class AuthorizationRequestDTO {

    private String patientName;
    private String diagnosis;
    private String procedureName;
    private Long providerId;
    private Long payerId;
    private String aiReviewToken;

}