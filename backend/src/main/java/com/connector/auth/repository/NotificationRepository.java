package com.connector.auth.repository;

import com.connector.auth.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(String recipient);
    long countByRecipientAndReadFlagFalse(String recipient);
}
