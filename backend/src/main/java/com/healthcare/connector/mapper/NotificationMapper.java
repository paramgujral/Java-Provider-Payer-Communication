package com.healthcare.connector.mapper;

import com.healthcare.connector.dto.NotificationDto;
import com.healthcare.connector.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(source = "notificationId", target = "id")
    @Mapping(source = "createdDate", target = "timestamp")
    @Mapping(target = "type", ignore = true) // Will be set based on business logic
    @Mapping(target = "actionUrl", ignore = true)
    @Mapping(target = "relatedId", ignore = true)
    NotificationDto toDto(Notification entity);

    @Mapping(source = "id", target = "notificationId")
    @Mapping(source = "timestamp", target = "createdDate")
    Notification toEntity(NotificationDto dto);
}
