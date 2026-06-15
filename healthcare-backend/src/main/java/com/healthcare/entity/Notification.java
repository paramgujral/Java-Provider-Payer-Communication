package com.healthcare.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Represents an in-app notification sent to a Provider or Payer
 * when the status of an authorization request changes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;

    /** The user/organization this notification is for */
    @Indexed
    private String recipientId;

    /** The authorization request this notification is about */
    private String authorizationRequestId;

    private String title;
    private String message;
    private NotificationType type;
    private boolean read;

    @CreatedDate
    private Instant createdAt;

    public enum NotificationType {
        REQUEST_SUBMITTED,
        REQUEST_APPROVED,
        REQUEST_REJECTED,
        INFO_REQUESTED
    }
}
