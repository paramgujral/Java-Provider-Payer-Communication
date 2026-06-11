package com.healthcare.connector.controller;

import com.healthcare.connector.dto.DocumentDto;
import com.healthcare.connector.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<DocumentDto> uploadDocument(@RequestParam("file") MultipartFile file, @RequestParam("requestId") Long requestId) {
        return ResponseEntity.ok(documentService.uploadDocument(file, requestId));
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<List<DocumentDto>> getDocumentsByRequestId(@PathVariable Long requestId) {
        return ResponseEntity.ok(documentService.getDocumentsByRequestId(requestId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
