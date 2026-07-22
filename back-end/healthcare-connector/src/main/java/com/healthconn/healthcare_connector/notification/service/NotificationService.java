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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void sendNotification(User recipient, AuthorizationRequest request,
                                 NotificationType type, String title, String message) {
        // Save the notification for later retrieval.
        Notification notification = Notification.builder()
                .recipient(recipient).request(request)
                .type(type).title(title).message(message).build();
        notificationRepository.save(notification);

        // Send the same notification to the user's WebSocket queue.
        WsNotificationPayload payload = new WsNotificationPayload(
                title, message, type,
                request != null ? request.getId() : null,
                LocalDateTime.now());
        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(), "/queue/notifications", payload);
        log.info("Notification sent to {} with title {}", recipient.getEmail(), title);
    }

    @Transactional
    public void notifyPayersNewRequest(AuthorizationRequest request, List<User> payers) {
        String title = "New Authorization Request";
        String msg = String.format("Patient %s - procedure %s requires authorization",
                request.getPatientName(), request.getProcedureCode());
        payers.forEach(p -> sendNotification(p, request, NotificationType.NEW_REQUEST, title, msg));
    }

    @Transactional
    public void notifyProviderDecision(AuthorizationRequest request) {
        boolean approved = request.getStatus().name().equals("APPROVED");
        String title = approved ? "Request Approved" : "Request Rejected";
        String msg = approved
                ? String.format("Authorization for patient %s has been approved.", request.getPatientName())
                : String.format("Authorization for patient %s was rejected. Reason: %s",
                request.getPatientName(), request.getRejectionReason());
        NotificationType type = approved
                ? NotificationType.REQUEST_APPROVED : NotificationType.REQUEST_REJECTED;
        sendNotification(request.getProvider(), request, type, title, msg);
    }

    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream().map(this::buildNotificationDto).collect(Collectors.toList());
    }

    public long countUnreadNotifications(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markNotificationsAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }

    @Transactional
    public void markNotificationAsRead(Long notificationId, Long userId) {
        notificationRepository.markOneAsReadForUser(notificationId, userId);
    }

    private NotificationDto buildNotificationDto(Notification n) {
        return new NotificationDto(n.getId(), n.getTitle(), n.getMessage(), n.getType(),
                n.getRequest() != null ? n.getRequest().getId() : null,
                n.isRead(), n.getCreatedAt());
    }
}