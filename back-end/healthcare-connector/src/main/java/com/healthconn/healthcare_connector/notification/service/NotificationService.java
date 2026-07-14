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

    // ==========================================================
    // Send Notification
    // ==========================================================

    @Transactional
    public void sendNotification(User recipient,
                                 AuthorizationRequest request,
                                 NotificationType type,
                                 String title,
                                 String message) {

        Notification notification = Notification.builder()
                .recipient(recipient)
                .request(request)
                .type(type)
                .title(title)
                .message(message)
                .build();

        notification = notificationRepository.save(notification);

        WsNotificationPayload payload =
                new WsNotificationPayload(
                        notification.getTitle(),
                        notification.getMessage(),
                        notification.getType(),
                        request != null ? request.getId() : null,
                        notification.getCreatedAt()
                );

        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                "/queue/notifications",
                payload
        );

        log.info("Notification sent to {} ({})",
                recipient.getEmail(),
                type);
    }

    // ==========================================================
    // Notify Payers
    // ==========================================================

    @Transactional
    public void notifyPayersNewRequest(AuthorizationRequest request,
                                       List<User> payers) {

        final String title = "New Authorization Request";

        final String message = String.format(
                "Patient %s - Procedure %s requires authorization.",
                request.getPatientName(),
                request.getProcedureCode()
        );

        payers.forEach(
                payer -> sendNotification(
                        payer,
                        request,
                        NotificationType.NEW_REQUEST,
                        title,
                        message
                )
        );
    }

    // ==========================================================
    // Notify Provider
    // ==========================================================

    @Transactional
    public void notifyProviderDecision(
            AuthorizationRequest request) {

        boolean approved =
                request.getStatus().name().equals("APPROVED");

        String title =
                approved
                        ? "Request Approved"
                        : "Request Rejected";

        String message =
                approved
                        ? String.format(
                        "Authorization request for patient %s has been approved.",
                        request.getPatientName()
                )
                        : String.format(
                        "Authorization request for patient %s was rejected. Reason: %s",
                        request.getPatientName(),
                        request.getRejectionReason()
                );

        NotificationType type =
                approved
                        ? NotificationType.REQUEST_APPROVED
                        : NotificationType.REQUEST_REJECTED;

        sendNotification(
                request.getProvider(),
                request,
                type,
                title,
                message
        );
    }

    // ==========================================================
    // Get Notifications
    // ==========================================================

    public List<NotificationDto> getNotificationsForUser(
            Long userId) {

        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ==========================================================
    // Unread Count
    // ==========================================================

    public long getUnreadCount(Long userId) {

        return notificationRepository
                .countByRecipientIdAndIsReadFalse(userId);
    }

    // ==========================================================
    // Mark All Read
    // ==========================================================

    @Transactional
    public void markAllRead(Long userId) {

        notificationRepository
                .markAllAsReadForUser(userId);
    }

    // ==========================================================
    // DTO Mapper
    // ==========================================================

    private NotificationDto toDto(Notification notification) {

        return new NotificationDto(

                notification.getId(),

                notification.getTitle(),

                notification.getMessage(),

                notification.getType(),

                notification.getRequest() != null
                        ? notification.getRequest().getId()
                        : null,

                notification.isRead(),

                notification.getCreatedAt()

        );
    }

}