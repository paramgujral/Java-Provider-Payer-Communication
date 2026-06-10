package com.connector.auth.service;

import com.connector.auth.domain.Notification;
import com.connector.auth.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) { this.repo = repo; }

    public Notification push(Long requestId, String recipient, String title, String message, String level) {
        return repo.save(new Notification(requestId, recipient, title, message, level));
    }

    public List<Notification> forRecipient(String recipient) {
        return repo.findByRecipientOrderByCreatedAtDesc(recipient.toUpperCase());
    }

    public long unread(String recipient) {
        return repo.countByRecipientAndReadFlagFalse(recipient.toUpperCase());
    }

    public Notification markRead(Long id) {
        Notification n = repo.findById(id).orElseThrow();
        n.setReadFlag(true);
        return repo.save(n);
    }

    public void markAllRead(String recipient) {
        List<Notification> list = repo.findByRecipientOrderByCreatedAtDesc(recipient.toUpperCase());
        list.forEach(n -> n.setReadFlag(true));
        repo.saveAll(list);
    }
}
