public record WsNotificationPayload(
        String title,
        String message,
        NotificationType type,
        Long requestId,
        LocalDateTime createdAt,
        String recipientRole,    
        String fhirResourceId    
) {}
