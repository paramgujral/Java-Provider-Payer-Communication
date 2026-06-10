package com.feignClient.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.feignClient.Auth.Notification;
import com.feignClient.Repository.NotificationRepository;
import com.feignClient.Service.NotificationService;
import com.feignClient.dto.NotificationCountDto;

@RestController
@RequestMapping("/api/notification")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    @Autowired
    private NotificationRepository repository;
    
    @Autowired
    private NotificationService service;
  
    @GetMapping("/{providerId}")
    public List<Notification> getNotifications(
            @PathVariable Long providerId){

        return repository.findByProviderId(providerId);
    }
    //new chnages
    @GetMapping("/all")
    public List<Notification> getAllNotification() {
        return service.getAllNotifications();
    }
    @GetMapping("/count")
    public NotificationCountDto getCount() {
        return service.getNotificationCount();
    }
}
