package com.example.demo.repository;

import com.example.demo.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    // All notifications for a provider, newest first
    List<Notification> findByProviderIdOrderByCreatedAtDesc(Long providerId);

    // Unread notifications for a provider
    List<Notification> findByProviderIdAndIsReadFalse(Long providerId);

    // Count unread
    long countByProviderIdAndIsReadFalse(Long providerId);
}