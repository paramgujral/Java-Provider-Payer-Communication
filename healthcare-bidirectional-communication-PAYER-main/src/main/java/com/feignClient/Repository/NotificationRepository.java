package com.feignClient.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.feignClient.Auth.Notification;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByProviderId(Long providerId);
    
   
}