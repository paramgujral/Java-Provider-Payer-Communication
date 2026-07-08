public record NotificationDto(
        Long id,
        String title,
        String message,
        NotificationType type,
        Long requestId,
        boolean isRead,
        LocalDateTime createdAt,
        String recipientEmail,   
        String recipientRole     
) {}
