package com.healthcare.connector.mapper;

import com.healthcare.connector.dto.ChatAttachmentDto;
import com.healthcare.connector.dto.MessageDto;
import com.healthcare.connector.entity.ChatAttachment;
import com.healthcare.connector.entity.Message;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-11T00:47:18+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.43.0.v20250819-1513, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class MessageMapperImpl implements MessageMapper {

    @Autowired
    private ChatAttachmentMapper chatAttachmentMapper;

    @Override
    public MessageDto toDto(Message entity) {
        if ( entity == null ) {
            return null;
        }

        MessageDto messageDto = new MessageDto();

        if ( entity.getMessageId() != null ) {
            messageDto.setId( String.valueOf( entity.getMessageId() ) );
        }
        messageDto.setTimestamp( entity.getCreatedDate() );
        messageDto.setAttachments( chatAttachmentListToChatAttachmentDtoList( entity.getAttachments() ) );
        messageDto.setMessage( entity.getMessage() );
        if ( entity.getReceiverId() != null ) {
            messageDto.setReceiverId( String.valueOf( entity.getReceiverId() ) );
        }
        if ( entity.getSenderId() != null ) {
            messageDto.setSenderId( String.valueOf( entity.getSenderId() ) );
        }

        return messageDto;
    }

    @Override
    public Message toEntity(MessageDto dto) {
        if ( dto == null ) {
            return null;
        }

        Message.MessageBuilder message = Message.builder();

        if ( dto.getId() != null ) {
            message.messageId( Long.parseLong( dto.getId() ) );
        }
        message.createdDate( dto.getTimestamp() );
        message.attachments( chatAttachmentDtoListToChatAttachmentList( dto.getAttachments() ) );
        message.message( dto.getMessage() );
        if ( dto.getReceiverId() != null ) {
            message.receiverId( Long.parseLong( dto.getReceiverId() ) );
        }
        if ( dto.getSenderId() != null ) {
            message.senderId( Long.parseLong( dto.getSenderId() ) );
        }

        return message.build();
    }

    protected List<ChatAttachmentDto> chatAttachmentListToChatAttachmentDtoList(List<ChatAttachment> list) {
        if ( list == null ) {
            return null;
        }

        List<ChatAttachmentDto> list1 = new ArrayList<ChatAttachmentDto>( list.size() );
        for ( ChatAttachment chatAttachment : list ) {
            list1.add( chatAttachmentMapper.toDto( chatAttachment ) );
        }

        return list1;
    }

    protected List<ChatAttachment> chatAttachmentDtoListToChatAttachmentList(List<ChatAttachmentDto> list) {
        if ( list == null ) {
            return null;
        }

        List<ChatAttachment> list1 = new ArrayList<ChatAttachment>( list.size() );
        for ( ChatAttachmentDto chatAttachmentDto : list ) {
            list1.add( chatAttachmentMapper.toEntity( chatAttachmentDto ) );
        }

        return list1;
    }
}
