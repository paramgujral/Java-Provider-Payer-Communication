package com.example.healthcareconnector.service;

import com.example.healthcareconnector.entity.AuthorizationRequest;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    public String sendNotification(AuthorizationRequest request){

        return "Notification sent: Authorization request "
                        + request.getId()
                        + " status changed to "
                        + request.getStatus();

    }
}
