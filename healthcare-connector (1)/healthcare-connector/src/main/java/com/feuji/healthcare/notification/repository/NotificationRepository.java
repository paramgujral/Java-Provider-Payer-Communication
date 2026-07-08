package com.feuji.healthcare.notification.repository;

import com.feuji.healthcare.notification.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository
        extends JpaRepository<NotificationEntity, Long> {
}