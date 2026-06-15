package com.healthcare.service.impl;

import com.healthcare.entity.AuthorizationRequest;
import com.healthcare.entity.Notification;
import com.healthcare.exception.ResourceNotFoundException;
import com.healthcare.repository.NotificationRepository;
import com.healthcare.service.EmailService;
import com.healthcare.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final TemplateEngine templateEngine;

    @Override
    public void notifyStatusChange(AuthorizationRequest request, AuthorizationRequest.RequestStatus newStatus) {
        log.info("Creating notifications for request: {} with new status: {}", request.getId(), newStatus);

        // Extract patient name for templates
        String patientName = "N/A";
        if (request.getPatientInfo() != null) {
            patientName = (request.getPatientInfo().getFirstName() != null ? request.getPatientInfo().getFirstName() : "")
                    + " " +
                    (request.getPatientInfo().getLastName() != null ? request.getPatientInfo().getLastName() : "");
            patientName = patientName.trim().isEmpty() ? "N/A" : patientName.trim();
        }

        switch (newStatus) {
            case PENDING -> {
                String title = "New Authorization Request";
                String message = "A new authorization request (ID: " + request.getId() + ") has been submitted by provider "
                        + request.getProviderId() + " and is awaiting your review.";
                createAndSave(request.getPayerId(), request.getId(), title, message,
                        Notification.NotificationType.REQUEST_SUBMITTED);

                // Send styled email to Payer
                Context ctx = buildContext(title, message, request.getId(), request.getProviderId(),
                        request.getPayerId(), patientName);
                String htmlBody = templateEngine.process("email/request-submitted", ctx);
                emailService.sendEmail(request.getPayerId(), "Healthcare Connector - " + title, htmlBody);
            }
            case APPROVED -> {
                String title = "Request Approved";
                String message = "Your authorization request (ID: " + request.getId() + ") has been approved by payer "
                        + request.getPayerId() + ".";
                createAndSave(request.getProviderId(), request.getId(), title, message,
                        Notification.NotificationType.REQUEST_APPROVED);

                Context ctx = buildContext(title, message, request.getId(), request.getProviderId(),
                        request.getPayerId(), patientName);
                String htmlBody = templateEngine.process("email/request-approved", ctx);
                emailService.sendEmail(request.getProviderId(), "Healthcare Connector - " + title, htmlBody);
            }
            case REJECTED -> {
                String title = "Request Rejected";
                String message = "Your authorization request (ID: " + request.getId() + ") has been rejected by payer "
                        + request.getPayerId() + ". Please review and resubmit if needed.";
                createAndSave(request.getProviderId(), request.getId(), title, message,
                        Notification.NotificationType.REQUEST_REJECTED);

                Context ctx = buildContext(title, message, request.getId(), request.getProviderId(),
                        request.getPayerId(), patientName);
                String htmlBody = templateEngine.process("email/request-rejected", ctx);
                emailService.sendEmail(request.getProviderId(), "Healthcare Connector - " + title, htmlBody);
            }
            case INFO_REQUESTED -> {
                String title = "More Information Required";
                String message = "Payer " + request.getPayerId() + " has requested additional information for request (ID: "
                        + request.getId() + "). Please update and resubmit.";
                createAndSave(request.getProviderId(), request.getId(), title, message,
                        Notification.NotificationType.INFO_REQUESTED);

                Context ctx = buildContext(title, message, request.getId(), request.getProviderId(),
                        request.getPayerId(), patientName);
                String htmlBody = templateEngine.process("email/info-requested", ctx);
                emailService.sendEmail(request.getProviderId(), "Healthcare Connector - " + title, htmlBody);
            }
            default -> log.warn("No notification configured for status: {}", newStatus);
        }
    }

    @Override
    public Page<Notification> getNotifications(String recipientId, Pageable pageable) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId, pageable);
    }

    @Override
    public List<Notification> getUnreadNotifications(String recipientId) {
        return notificationRepository.findByRecipientIdAndReadFalseOrderByCreatedAtDesc(recipientId);
    }

    @Override
    public long getUnreadCount(String recipientId) {
        return notificationRepository.countByRecipientIdAndReadFalse(recipientId);
    }

    @Override
    public Notification markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(String recipientId) {
        List<Notification> unread = notificationRepository
                .findByRecipientIdAndReadFalseOrderByCreatedAtDesc(recipientId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        log.info("Marked {} notifications as read for recipient: {}", unread.size(), recipientId);
    }

    private void createAndSave(String recipientId, String requestId, String title, String message,
                                Notification.NotificationType type) {
        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .authorizationRequestId(requestId)
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .build();
        notificationRepository.save(notification);
        log.info("In-app notification sent to {}: {}", recipientId, title);
    }

    /**
     * Builds a Thymeleaf Context with all variables needed by the email templates.
     */
    private Context buildContext(String title, String message, String requestId,
                                 String providerId, String payerId, String patientName) {
        Context ctx = new Context();
        ctx.setVariable("title", title);
        ctx.setVariable("message", message);
        ctx.setVariable("requestId", requestId);
        ctx.setVariable("providerId", providerId);
        ctx.setVariable("payerId", payerId);
        ctx.setVariable("patientName", patientName);
        return ctx;
    }
}
