package com.healthcare.connector.repositories;

import com.healthcare.connector.models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientEmailAndIsReadFalse(String email);
}
