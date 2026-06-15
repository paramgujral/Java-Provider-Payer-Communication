package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NetworkMessageDto {
    private String id;
    private String affiliationId;
    private String senderId;
    private String senderRole;
    private String content;
    private Instant createdAt;
}
