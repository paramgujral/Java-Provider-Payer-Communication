package com.healthcare.connector.mapper;

import com.healthcare.connector.dto.NotificationDto;
import com.healthcare.connector.entity.Notification;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-11T00:36:12+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.43.0.v20250819-1513, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class NotificationMapperImpl implements NotificationMapper {

    @Override
    public NotificationDto toDto(Notification entity) {
        if ( entity == null ) {
            return null;
        }

        NotificationDto notificationDto = new NotificationDto();

        if ( entity.getNotificationId() != null ) {
            notificationDto.setId( String.valueOf( entity.getNotificationId() ) );
        }
        notificationDto.setTimestamp( entity.getCreatedDate() );
        notificationDto.setTitle( entity.getTitle() );

        return notificationDto;
    }

    @Override
    public Notification toEntity(NotificationDto dto) {
        if ( dto == null ) {
            return null;
        }

        Notification.NotificationBuilder notification = Notification.builder();

        if ( dto.getId() != null ) {
            notification.notificationId( Long.parseLong( dto.getId() ) );
        }
        notification.createdDate( dto.getTimestamp() );
        notification.title( dto.getTitle() );

        return notification.build();
    }
}
