package com.healthcare.connector.dto;

import lombok.Data;

@Data
public class ChatAttachmentDto {
    private String id;
    private String name;
    private String type;
    private Long size;
    private String url;
}
