package com.healthcare.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long authorizationId;
    private String receiverEmail;
    private String subject;

    @Column(length = 1000)
    private String message;

    private String status;
    private LocalDateTime sentAt;
}
