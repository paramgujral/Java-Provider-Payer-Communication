package com.healthcare.connector.dto;

import com.healthcare.connector.entity.UserRole;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class MessageDto {
    private String id;
    private String sender;
    private String senderId;
    private String receiver;
    private String receiverId;
    private String message;
    private LocalDateTime timestamp;
    private List<ChatAttachmentDto> attachments;
    private boolean isTyping;
    private boolean read;
}
