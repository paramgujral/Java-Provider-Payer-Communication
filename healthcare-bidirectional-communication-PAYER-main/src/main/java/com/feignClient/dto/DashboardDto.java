package com.feignClient.dto;
import lombok.Data;

@Data
public class DashboardDto {

    private long pending;
    private long approved;
    private long rejected;
    private long resubmitted;

    // getters and setters
}
