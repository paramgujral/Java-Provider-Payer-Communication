package com.healthcare.connector.mapper;

import com.healthcare.connector.dto.MessageDto;
import com.healthcare.connector.entity.Message;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ChatAttachmentMapper.class})
public interface MessageMapper {

    @Mapping(source = "messageId", target = "id")
    @Mapping(source = "createdDate", target = "timestamp")
    @Mapping(target = "sender", ignore = true)
    @Mapping(target = "receiver", ignore = true)
//    @Mapping(target = "isTyping", ignore = true)
    @Mapping(target = "read", ignore = true)
    MessageDto toDto(Message entity);

    @Mapping(source = "id", target = "messageId")
    @Mapping(source = "timestamp", target = "createdDate")
    @Mapping(target = "senderRole", ignore = true)
    @Mapping(target = "receiverRole", ignore = true)
    Message toEntity(MessageDto dto);
}
