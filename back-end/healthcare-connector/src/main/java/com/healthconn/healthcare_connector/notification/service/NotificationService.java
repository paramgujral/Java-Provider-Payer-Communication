package com.healthconn.healthcare_connector.notification.service;


import com.healthconn.healthcare_connector.authentication.entity.User;
import com.healthconn.healthcare_connector.notification.dto.NotificationDto;
import com.healthconn.healthcare_connector.notification.dto.WsNotificationPayload;
import com.healthconn.healthcare_connector.notification.entity.Notification;
import com.healthconn.healthcare_connector.notification.entity.NotificationType;
import com.healthconn.healthcare_connector.notification.repository.NotificationRepository;
import com.healthconn.healthcare_connector.provider.entity.AuthorizationRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void sendNotification(User recipient, AuthorizationRequest request,
                                 NotificationType type, String title, String message) {
        // 1. Save to DB
        Notification notification = Notification.builder()
                .recipient(recipient).request(request)
                .type(type).title(title).message(message).build();
        notificationRepository.save(notification);

        // 2. Push via WebSocket to user queue
        WsNotificationPayload payload = new WsNotificationPayload(
                title, message, type,
                request != null ? request.getId() : null,
                LocalDateTime.now());
        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(), "/queue/notifications", payload);
        log.info("Notification → {} | {}", recipient.getEmail(), title);
    }

    @Transactional
    public void notifyPayersNewRequest(AuthorizationRequest request, List<User> payers) {
        String title = "New Authorization Request";
        String msg = String.format("Patient %s — procedure %s requires authorization",
                request.getPatientName(), request.getProcedureCode());
        payers.forEach(p -> sendNotification(p, request, NotificationType.NEW_REQUEST, title, msg));
    }

    @Transactional
    public void notifyProviderDecision(AuthorizationRequest request) {
        boolean approved = request.getStatus().name().equals("APPROVED");
        String title = approved ? "✓ Request Approved" : "Request Rejected";
        String msg = approved
                ? String.format("Authorization for patient %s has been approved.", request.getPatientName())
                : String.format("Authorization for patient %s was rejected. Reason: %s",
                request.getPatientName(), request.getRejectionReason());
        NotificationType type = approved
                ? NotificationType.REQUEST_APPROVED : NotificationType.REQUEST_REJECTED;
        sendNotification(request.getProvider(), request, type, title, msg);
    }

    public List<NotificationDto> getNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDto).toList();
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }

    private NotificationDto toDto(Notification n) {
        return new NotificationDto(n.getId(), n.getTitle(), n.getMessage(), n.getType(),
                n.getRequest() != null ? n.getRequest().getId() : null,
                n.isRead(), n.getCreatedAt());
    }
}