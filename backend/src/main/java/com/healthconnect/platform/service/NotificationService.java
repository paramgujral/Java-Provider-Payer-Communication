package com.healthconnect.platform.service;

import com.healthconnect.platform.dto.response.NotificationResponse;
import com.healthconnect.platform.entity.AuthorizationRequest;
import com.healthconnect.platform.entity.Notification;
import com.healthconnect.platform.entity.User;
import com.healthconnect.platform.enums.NotificationType;
import com.healthconnect.platform.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void send(User recipient, NotificationType type, String title,
                     String message, AuthorizationRequest request) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .authorizationRequest(request)
                .build();
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getForUser(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByRecipientAndReadFalse(user);
    }

    @Transactional
    public void markAsRead(Long notificationId, User user) {
        notificationRepository.markAsRead(notificationId, user);
    }

    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadForUser(user);
    }

    // Convenience factory methods for each notification type
    public void notifyApproved(User provider, AuthorizationRequest request) {
        send(provider, NotificationType.REQUEST_APPROVED,
                "Authorization Request Approved",
                String.format("Your request %s for patient %s has been approved.",
                        request.getReferenceNumber(), request.getPatientName()),
                request);
    }

    public void notifyDenied(User provider, AuthorizationRequest request, String reason) {
        send(provider, NotificationType.REQUEST_DENIED,
                "Authorization Request Denied",
                String.format("Your request %s for patient %s has been denied. Reason: %s",
                        request.getReferenceNumber(), request.getPatientName(), reason),
                request);
    }

    public void notifyInfoRequested(User provider, AuthorizationRequest request, String info) {
        send(provider, NotificationType.INFO_REQUESTED,
                "Additional Information Required",
                String.format("Additional information is required for request %s: %s",
                        request.getReferenceNumber(), info),
                request);
    }

    public void notifyAiWarning(User provider, AuthorizationRequest request, String warning) {
        send(provider, NotificationType.AI_WARNING,
                "AI Validation Warning",
                String.format("AI analysis for request %s: %s",
                        request.getReferenceNumber(), warning),
                request);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .typeDisplayName(n.getType().getDisplayName())
                .title(n.getTitle())
                .message(n.getMessage())
                .read(n.isRead())
                .requestId(n.getAuthorizationRequest() != null ? n.getAuthorizationRequest().getId() : null)
                .referenceNumber(n.getAuthorizationRequest() != null ? n.getAuthorizationRequest().getReferenceNumber() : null)
                .createdAt(n.getCreatedAt())
                .build();
    }
}
