package com.feuji.healthcare.communication.dto;

import com.feuji.healthcare.communication.enums.CommunicationType;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunicationResponseDto {

    private Long id;

    private Long authorizationId;

    private CommunicationType senderType;

    private String message;
}