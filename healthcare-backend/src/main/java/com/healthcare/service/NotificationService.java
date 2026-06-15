package com.healthcare.service;

import com.healthcare.entity.AuthorizationRequest;
import com.healthcare.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {

    /**
     * Creates notifications for both Provider and Payer when a status changes.
     */
    void notifyStatusChange(AuthorizationRequest request, AuthorizationRequest.RequestStatus newStatus);

    /**
     * Retrieves all notifications for a given recipient (paginated).
     */
    Page<Notification> getNotifications(String recipientId, Pageable pageable);

    /**
     * Retrieves only unread notifications for a given recipient.
     */
    List<Notification> getUnreadNotifications(String recipientId);

    /**
     * Returns the count of unread notifications for a recipient.
     */
    long getUnreadCount(String recipientId);

    /**
     * Marks a single notification as read.
     */
    Notification markAsRead(String notificationId);

    /**
     * Marks all notifications for a recipient as read.
     */
    void markAllAsRead(String recipientId);
}
