package com.healthcare.notification.service;

import org.springframework.stereotype.Service;

import com.healthcare.notification.dto.NotificationRequest;
import com.healthcare.notification.dto.NotificationResponse;

@Service
public class NotificationService {

    public NotificationResponse send(NotificationRequest request) {
        String message = request.getMessage() == null || request.getMessage().isBlank()
                ? "Notification for " + request.getEvent() + " sent to " + request.getRecipient()
                : request.getMessage();

        return NotificationResponse.builder()
                .sent(true)
                .message(message)
                .build();
    }
}
