package com.healthcare.payer.dto;

import lombok.Data;

@Data
public class ProviderStatusRequest {

    private String status;

    private String comments;
}