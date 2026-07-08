package com.feuji.healthcare.notification.entity;

import com.feuji.healthcare.common.entity.AuditEntity;
import com.feuji.healthcare.notification.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEntity extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;

    private Boolean isRead;
}
