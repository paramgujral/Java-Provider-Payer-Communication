package com.healthcare.connector.mapper;

import com.healthcare.connector.dto.ChatAttachmentDto;
import com.healthcare.connector.entity.ChatAttachment;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-11T00:36:13+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.43.0.v20250819-1513, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class ChatAttachmentMapperImpl implements ChatAttachmentMapper {

    @Override
    public ChatAttachmentDto toDto(ChatAttachment entity) {
        if ( entity == null ) {
            return null;
        }

        ChatAttachmentDto chatAttachmentDto = new ChatAttachmentDto();

        if ( entity.getId() != null ) {
            chatAttachmentDto.setId( String.valueOf( entity.getId() ) );
        }
        chatAttachmentDto.setName( entity.getName() );
        chatAttachmentDto.setType( entity.getType() );
        chatAttachmentDto.setSize( entity.getSize() );
        chatAttachmentDto.setUrl( entity.getUrl() );

        return chatAttachmentDto;
    }

    @Override
    public ChatAttachment toEntity(ChatAttachmentDto dto) {
        if ( dto == null ) {
            return null;
        }

        ChatAttachment.ChatAttachmentBuilder chatAttachment = ChatAttachment.builder();

        if ( dto.getId() != null ) {
            chatAttachment.id( Long.parseLong( dto.getId() ) );
        }
        chatAttachment.name( dto.getName() );
        chatAttachment.size( dto.getSize() );
        chatAttachment.type( dto.getType() );
        chatAttachment.url( dto.getUrl() );

        return chatAttachment.build();
    }
}
