package com.healthcare.common.response;

import java.time.Instant;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private Instant timestamp;
}
