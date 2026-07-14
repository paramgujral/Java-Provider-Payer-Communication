package com.healthconn.healthcare_connector.notification.repository;

import com.healthconn.healthcare_connector.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Returns all notifications of a user ordered by newest first.
     */
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(
            Long recipientId
    );

    /**
     * Returns unread notification count.
     */
    long countByRecipientIdAndIsReadFalse(
            Long recipientId
    );

    /**
     * Marks all notifications as read for the given user.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Notification n
               SET n.isRead = true
             WHERE n.recipient.id = :userId
            """)
    void markAllAsReadForUser(
            @Param("userId") Long userId
    );

}