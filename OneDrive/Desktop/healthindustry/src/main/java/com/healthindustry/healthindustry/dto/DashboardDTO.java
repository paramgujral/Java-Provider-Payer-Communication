package com.healthindustry.healthindustry.dto;


import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {

    private long submitted;

    private long pending;

    private long approved;

    private long rejected;
}