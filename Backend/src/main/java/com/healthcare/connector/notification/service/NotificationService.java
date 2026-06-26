package com.healthcare.connector.notification.service;

import com.healthcare.connector.auth.entity.User;
import com.healthcare.connector.authorization.entity.AuthorizationRequest;
import com.healthcare.connector.notification.entity.Notification;
import com.healthcare.connector.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Async
    @Transactional
    public void sendStatusChangeNotification(AuthorizationRequest request, String oldStatus, String newStatus) {
        String title = "Authorization Status Updated";
        String message = String.format("Request %s has been updated from %s to %s.",
                request.getReferenceNumber(), oldStatus, newStatus);

        // Notify provider
        if (request.getProvider() != null) {
            createAndPush(request.getProvider(), title, message, "STATUS_CHANGE", request);
        }
        // Notify payer
        if (request.getPayer() != null) {
            createAndPush(request.getPayer(), title, message, "STATUS_CHANGE", request);
        }
    }

    @Async
    @Transactional
    public void sendAiReviewCompleteNotification(AuthorizationRequest request) {
        String title = "AI Copilot Review Complete";
        String message = String.format("AI review completed for request %s. Confidence score: %d%%.",
                request.getReferenceNumber(), request.getAiConfidenceScore());
        if (request.getProvider() != null) {
            createAndPush(request.getProvider(), title, message, "AI_REVIEW", request);
        }
    }

    @Async
    @Transactional
    public void sendPayerDecisionNotification(AuthorizationRequest request) {
        String status = request.getStatus().name();
        String title = "Authorization Decision Received";
        String message = String.format("Request %s has been %s by %s.",
                request.getReferenceNumber(), status.toLowerCase(), request.getPayerName());
        if (request.getProvider() != null) {
            createAndPush(request.getProvider(), title, message, "DECISION", request);
        }
    }

    @Async
    @Transactional
    public void sendInfoRequestNotification(AuthorizationRequest request, String infoRequested) {
        String title = "Additional Information Required";
        String message = String.format("Payer %s is requesting additional information for request %s.",
                request.getPayerName(), request.getReferenceNumber());
        if (request.getProvider() != null) {
            createAndPush(request.getProvider(), title, message, "INFO_REQUEST", request);
        }
    }

    private void createAndPush(User recipient, String title, String message, String type,
                               AuthorizationRequest request) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .type(type)
                .referenceNumber(request.getReferenceNumber())
                .authRequestId(request.getId())
                .build();
        notificationRepository.save(notification);

        // Real-time WebSocket push
        try {
            messagingTemplate.convertAndSendToUser(
                    recipient.getUsername(),
                    "/queue/notifications",
                    Map.of(
                            "id", notification.getId(),
                            "title", title,
                            "message", message,
                            "type", type,
                            "referenceNumber", request.getReferenceNumber(),
                            "authRequestId", request.getId(),
                            "createdAt", notification.getCreatedAt().toString()
                    )
            );
        } catch (Exception e) {
            log.warn("WebSocket push failed for user {}: {}", recipient.getUsername(), e.getMessage());
        }
    }

    public Page<Notification> getNotificationsForUser(User user, Pageable pageable) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user, pageable);
    }

    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByRecipientAndReadFalseOrderByCreatedAtDesc(user);
    }

    public Long getUnreadCount(User user) {
        return notificationRepository.countByRecipientAndReadFalse(user);
    }

    public void markAllAsRead(User user) {
        notificationRepository.markAllAsRead(user);
    }

    public void markAsRead(Long notificationId, User user) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getRecipient().getId().equals(user.getId())) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }
}

