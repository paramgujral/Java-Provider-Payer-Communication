package com.healthcare.connector.mapper;

import com.healthcare.connector.dto.AuthorizationRequestDto;
import com.healthcare.connector.dto.DocumentDto;
import com.healthcare.connector.entity.AuthorizationRequest;
import com.healthcare.connector.entity.Document;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-11T13:12:55+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.43.0.v20250819-1513, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class AuthorizationRequestMapperImpl implements AuthorizationRequestMapper {

    @Override
    public AuthorizationRequestDto toDto(AuthorizationRequest entity) {
        if ( entity == null ) {
            return null;
        }

        AuthorizationRequestDto authorizationRequestDto = new AuthorizationRequestDto();

        authorizationRequestDto.setId( entity.getRequestId() );
        authorizationRequestDto.setStatus( mapRequestStatusToString( entity.getStatus() ) );
        authorizationRequestDto.setClinicalNotes( entity.getClinicalNotes() );
        authorizationRequestDto.setDiagnosis( entity.getDiagnosis() );
        authorizationRequestDto.setDocuments( documentListToDocumentDtoList( entity.getDocuments() ) );
        authorizationRequestDto.setEstimatedCost( entity.getEstimatedCost() );
        authorizationRequestDto.setInsuranceId( entity.getInsuranceId() );
        authorizationRequestDto.setInsuranceProvider( entity.getInsuranceProvider() );
        authorizationRequestDto.setPatientId( entity.getPatientId() );
        authorizationRequestDto.setPatientName( entity.getPatientName() );
        authorizationRequestDto.setPayerId( entity.getPayerId() );
        authorizationRequestDto.setProcedureName( entity.getProcedureName() );
        authorizationRequestDto.setProviderId( entity.getProviderId() );

        return authorizationRequestDto;
    }

    @Override
    public AuthorizationRequest toEntity(AuthorizationRequestDto dto) {
        if ( dto == null ) {
            return null;
        }

        AuthorizationRequest.AuthorizationRequestBuilder authorizationRequest = AuthorizationRequest.builder();

        authorizationRequest.requestId( dto.getId() );
        authorizationRequest.status( mapStringToRequestStatus( dto.getStatus() ) );
        authorizationRequest.clinicalNotes( dto.getClinicalNotes() );
        authorizationRequest.diagnosis( dto.getDiagnosis() );
        authorizationRequest.documents( documentDtoListToDocumentList( dto.getDocuments() ) );
        authorizationRequest.estimatedCost( dto.getEstimatedCost() );
        authorizationRequest.insuranceId( dto.getInsuranceId() );
        authorizationRequest.insuranceProvider( dto.getInsuranceProvider() );
        authorizationRequest.patientId( dto.getPatientId() );
        authorizationRequest.patientName( dto.getPatientName() );
        authorizationRequest.payerId( dto.getPayerId() );
        authorizationRequest.procedureName( dto.getProcedureName() );
        authorizationRequest.providerId( dto.getProviderId() );

        return authorizationRequest.build();
    }

    protected DocumentDto documentToDocumentDto(Document document) {
        if ( document == null ) {
            return null;
        }

        DocumentDto documentDto = new DocumentDto();

        if ( document.getId() != null ) {
            documentDto.setId( String.valueOf( document.getId() ) );
        }
        documentDto.setName( document.getName() );
        documentDto.setSize( document.getSize() );
        documentDto.setType( document.getType() );
        documentDto.setUploadDate( document.getUploadDate() );
        documentDto.setUrl( document.getUrl() );

        return documentDto;
    }

    protected List<DocumentDto> documentListToDocumentDtoList(List<Document> list) {
        if ( list == null ) {
            return null;
        }

        List<DocumentDto> list1 = new ArrayList<DocumentDto>( list.size() );
        for ( Document document : list ) {
            list1.add( documentToDocumentDto( document ) );
        }

        return list1;
    }

    protected Document documentDtoToDocument(DocumentDto documentDto) {
        if ( documentDto == null ) {
            return null;
        }

        Document.DocumentBuilder document = Document.builder();

        if ( documentDto.getId() != null ) {
            document.id( Long.parseLong( documentDto.getId() ) );
        }
        document.name( documentDto.getName() );
        document.size( documentDto.getSize() );
        document.type( documentDto.getType() );
        document.uploadDate( documentDto.getUploadDate() );
        document.url( documentDto.getUrl() );

        return document.build();
    }

    protected List<Document> documentDtoListToDocumentList(List<DocumentDto> list) {
        if ( list == null ) {
            return null;
        }

        List<Document> list1 = new ArrayList<Document>( list.size() );
        for ( DocumentDto documentDto : list ) {
            list1.add( documentDtoToDocument( documentDto ) );
        }

        return list1;
    }
}
