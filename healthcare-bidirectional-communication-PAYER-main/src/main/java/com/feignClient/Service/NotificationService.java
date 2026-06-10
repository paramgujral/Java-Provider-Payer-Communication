package com.feignClient.Service;

import java.util.List;

import com.feignClient.Auth.Notification;
import com.feignClient.dto.NotificationCountDto;

public interface NotificationService {
	
	public List<Notification> getAllNotifications();
	
	public NotificationCountDto getNotificationCount();

}
