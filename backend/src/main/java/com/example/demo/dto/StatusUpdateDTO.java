package com.example.demo.dto;

import com.example.demo.model.RequestStatus;
import lombok.Data;

@Data
public class StatusUpdateDTO {

    private RequestStatus status;


    private String payerRemarks;
}
