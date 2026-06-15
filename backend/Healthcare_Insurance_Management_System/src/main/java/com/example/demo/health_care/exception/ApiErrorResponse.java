package com.example.demo.health_care.exception;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApiErrorResponse {

    private LocalDateTime timestamp;

    private String path;

    private int status;

    private String error;

    private List<String> messages;
}

