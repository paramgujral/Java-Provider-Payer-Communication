package com.feuji.healthcare.communication.dto;

import com.feuji.healthcare.communication.enums.CommunicationType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommunicationRequestDto {

    private Long authorizationId;

    private CommunicationType senderType;

    private String message;
}