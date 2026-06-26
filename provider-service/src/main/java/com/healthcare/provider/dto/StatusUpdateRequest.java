package com.healthcare.provider.dto;

import lombok.Data;

@Data
public class StatusUpdateRequest {

    private String status;

    private String comments;
}