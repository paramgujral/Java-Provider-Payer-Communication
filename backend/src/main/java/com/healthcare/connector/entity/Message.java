package com.healthcare.connector.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageId;

    private Long requestId;
    private Long senderId;
    
    @Enumerated(EnumType.STRING)
    private UserRole senderRole;
    
    private Long receiverId;
    
    @Enumerated(EnumType.STRING)
    private UserRole receiverRole;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    private String attachmentUrl;

    @CreatedDate
    private LocalDateTime createdDate;

    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatAttachment> attachments = new java.util.ArrayList<>();
}
