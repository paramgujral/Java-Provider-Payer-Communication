package com.feuji.healthcare_connector.service;

import com.feuji.healthcare_connector.entity.AuthorizationRequest;
import com.feuji.healthcare_connector.entity.Document;
import com.feuji.healthcare_connector.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private CloudinaryService cloudinaryService;


    public Document saveFile(MultipartFile file, AuthorizationRequest request) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot save empty file.");
        }
        
        // Ensure size is less than 5MB
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds limit of 5MB.");
        }

        // Validate file extension
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            throw new IllegalArgumentException("File name is invalid.");
        }
        
        String fileExtension = getFileExtension(originalFileName).toLowerCase();
        if (!fileExtension.equals("pdf") && !fileExtension.equals("jpg") && 
            !fileExtension.equals("jpeg") && !fileExtension.equals("png")) {
            throw new IllegalArgumentException("Only PDF, JPG, JPEG, and PNG files are allowed.");
        }

        // Upload to Cloudinary
        String secureUrl = cloudinaryService.uploadFile(file);

        // Save metadata to DB
        Document document = new Document();
        document.setRequest(request);
        document.setFileName(originalFileName);
        document.setFileType(file.getContentType());
        document.setFilePath(secureUrl);
        document.setFileSize(file.getSize());
        document.setUploadedAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    public List<Document> getDocumentsForRequest(AuthorizationRequest request) {
        return documentRepository.findByRequest(request);
    }

    public Resource loadFileAsResource(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + documentId));
        try {
            if (document.getFilePath() != null && document.getFilePath().startsWith("http")) {
                // Return Cloudinary URL resource directly
                return new UrlResource(document.getFilePath());
            } else {
                // Fallback to local files if any exist
                Path filePath = Paths.get(document.getFilePath());
                Resource resource = new UrlResource(filePath.toUri());
                if (resource.exists() || resource.isReadable()) {
                    return resource;
                } else {
                    throw new RuntimeException("Could not read file: " + document.getFileName());
                }
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Could not read file: " + document.getFileName(), e);
        }
    }

    private String getFileExtension(String fileName) {
        int lastIndex = fileName.lastIndexOf('.');
        if (lastIndex == -1) {
            return "";
        }
        return fileName.substring(lastIndex + 1);
    }
}
