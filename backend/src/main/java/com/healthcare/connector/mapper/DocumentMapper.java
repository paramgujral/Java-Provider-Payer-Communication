package com.healthcare.connector.mapper;

import com.healthcare.connector.dto.DocumentDto;
import com.healthcare.connector.entity.Document;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DocumentMapper {
    @Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "type", target = "type")
    @Mapping(source = "size", target = "size")
    @Mapping(source = "uploadDate", target = "uploadDate")
    @Mapping(source = "url", target = "url")
    DocumentDto toDto(Document entity);

    @Mapping(target = "authorizationRequest", ignore = true)
    Document toEntity(DocumentDto dto);
}
