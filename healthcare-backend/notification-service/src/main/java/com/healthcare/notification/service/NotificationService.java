package com.healthcare.notification.service;

import com.healthcare.notification.entity.Notification;
import java.util.List;

public interface NotificationService {
    Notification send(Notification notification);
    Notification getById(Long id);
    List<Notification> getAll();
}
