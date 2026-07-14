package com.healthcare.notification.service.impl;

import com.healthcare.notification.entity.Notification;
import com.healthcare.notification.exception.ResourceNotFoundException;
import com.healthcare.notification.repository.NotificationRepository;
import com.healthcare.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository repository;

    public Notification send(Notification notification) {
        notification.setStatus("SENT");
        notification.setSentAt(LocalDateTime.now());
        return repository.save(notification);
    }

    public Notification getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
    }

    public List<Notification> getAll() {
        return repository.findAll();
    }
}
