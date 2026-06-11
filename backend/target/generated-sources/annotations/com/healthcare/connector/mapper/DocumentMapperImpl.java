package com.healthcare.connector.mapper;

import com.healthcare.connector.dto.DocumentDto;
import com.healthcare.connector.entity.Document;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-11T00:36:13+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.43.0.v20250819-1513, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class DocumentMapperImpl implements DocumentMapper {

    @Override
    public DocumentDto toDto(Document entity) {
        if ( entity == null ) {
            return null;
        }

        DocumentDto documentDto = new DocumentDto();

        if ( entity.getId() != null ) {
            documentDto.setId( String.valueOf( entity.getId() ) );
        }
        documentDto.setName( entity.getName() );
        documentDto.setType( entity.getType() );
        documentDto.setSize( entity.getSize() );
        documentDto.setUploadDate( entity.getUploadDate() );
        documentDto.setUrl( entity.getUrl() );

        return documentDto;
    }

    @Override
    public Document toEntity(DocumentDto dto) {
        if ( dto == null ) {
            return null;
        }

        Document.DocumentBuilder document = Document.builder();

        if ( dto.getId() != null ) {
            document.id( Long.parseLong( dto.getId() ) );
        }
        document.name( dto.getName() );
        document.size( dto.getSize() );
        document.type( dto.getType() );
        document.uploadDate( dto.getUploadDate() );
        document.url( dto.getUrl() );

        return document.build();
    }
}
