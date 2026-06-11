package com.healthcare.connector.mapper;

import com.healthcare.connector.dto.ChatAttachmentDto;
import com.healthcare.connector.entity.ChatAttachment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ChatAttachmentMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "type", target = "type")
    @Mapping(source = "size", target = "size")
    @Mapping(source = "url", target = "url")
    ChatAttachmentDto toDto(ChatAttachment entity);

    @Mapping(target = "message", ignore = true)
    ChatAttachment toEntity(ChatAttachmentDto dto);
}
