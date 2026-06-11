package com.healthcare.connector.service;

import com.healthcare.connector.dto.DocumentDto;
import com.healthcare.connector.entity.AuthorizationRequest;
import com.healthcare.connector.entity.Document;
import com.healthcare.connector.repository.AuthorizationRequestRepository;
import com.healthcare.connector.repository.DocumentRepository;
import com.healthcare.connector.mapper.DocumentMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final AuthorizationRequestRepository authorizationRequestRepository;
    private final DocumentMapper documentMapper;

    public DocumentService(DocumentRepository documentRepository, AuthorizationRequestRepository authorizationRequestRepository, DocumentMapper documentMapper) {
        this.documentRepository = documentRepository;
        this.authorizationRequestRepository = authorizationRequestRepository;
        this.documentMapper = documentMapper;
    }

    public DocumentDto uploadDocument(MultipartFile file, Long requestId) {
        AuthorizationRequest request = authorizationRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Authorization Request not found"));

        String fileUrl = saveFile(file);

        Document document = Document.builder()
                .authorizationRequest(request)
                .name(file.getOriginalFilename())
                .type(file.getContentType())
                .size(file.getSize())
                .url(fileUrl)
                .uploadDate(LocalDateTime.now())
                .build();
        return documentMapper.toDto(documentRepository.save(document));
    }

    public List<DocumentDto> getDocumentsByRequestId(Long requestId) {
        return documentRepository.findByAuthorizationRequestRequestId(requestId).stream()
                .map(documentMapper::toDto)
                .toList();
    }

    public void deleteDocument(Long id) {
        documentRepository.deleteById(id);
    }

    private String saveFile(MultipartFile file) {
        // In a real application, this would save to S3 or a file system.
        // For now, we'll just return a dummy URL.
        return "/uploads/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
    }
}
