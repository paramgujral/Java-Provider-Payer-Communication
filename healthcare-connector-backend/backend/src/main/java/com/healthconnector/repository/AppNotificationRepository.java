package com.healthconnector.repository;

import com.healthconnector.model.AppNotification;
import com.healthconnector.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppNotificationRepository extends JpaRepository<AppNotification, Long> {
    List<AppNotification> findByRecipientRoleOrderByCreatedAtDesc(UserRole role);
    List<AppNotification> findByRecipientUsernameOrderByCreatedAtDesc(String username);
}
