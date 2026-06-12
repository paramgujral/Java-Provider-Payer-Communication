package com.healthcare.connector.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "communications")
@Data
@NoArgsConstructor
public class Communication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FHIR Communication resource ref
    @Column(name = "fhir_resource_id")
    private String fhirResourceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private AuthorizationCase authorizationCase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "message_content", columnDefinition = "TEXT", nullable = false)
    private String messageContent;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type")
    private MessageType messageType = MessageType.CHAT;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @PrePersist
    protected void onCreate() {
        sentAt = LocalDateTime.now();
        fhirResourceId = "Communication/" + java.util.UUID.randomUUID().toString();
    }

    public enum MessageType {
        CHAT, SYSTEM, AI_INSIGHT, CLARIFICATION_REQUEST
    }
}
