package com.healthconnect.platform.repository;

import com.healthconnect.platform.entity.Notification;
import com.healthconnect.platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    List<Notification> findByRecipientAndReadFalseOrderByCreatedAtDesc(User recipient);

    long countByRecipientAndReadFalse(User recipient);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipient = :recipient AND n.read = false")
    void markAllAsReadForUser(@Param("recipient") User recipient);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.id = :id AND n.recipient = :recipient")
    void markAsRead(@Param("id") Long id, @Param("recipient") User recipient);
}
