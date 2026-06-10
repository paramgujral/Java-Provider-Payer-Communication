package com.feignClient.Impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Service;

import com.feignClient.Auth.AuthorizationRequest;
import com.feignClient.Auth.Notification;
import com.feignClient.Repository.NotificationRepository;
import com.feignClient.Service.NotificationService;
import com.feignClient.dto.NotificationCountDto;
@Service
public class NotificationImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepo;

    @Override
    public List<Notification> getAllNotifications() {
        return notificationRepo.findAll();
    }
    
    @Override
    public NotificationCountDto getNotificationCount() {

        List<Notification> list =
                notificationRepo.findAll();

        NotificationCountDto dto =
                new NotificationCountDto();

        dto.setUnreadCount(

            list.stream()
                .filter(x -> !x.getIsRead())
                .count()

        );

        return dto;
    }
}
