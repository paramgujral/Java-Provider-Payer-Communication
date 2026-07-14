package com.healthcare.authorization.service.impl;

import com.healthcare.authorization.entity.*;
import com.healthcare.authorization.exception.ResourceNotFoundException;
import com.healthcare.authorization.repository.AuthorizationRequestRepository;
import com.healthcare.authorization.service.AuthorizationRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthorizationRequestServiceImpl implements AuthorizationRequestService {
    private final AuthorizationRequestRepository repository;

    public AuthorizationRequest create(AuthorizationRequest request) {
        request.setStatus(AuthorizationStatus.CREATED);
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        return repository.save(request);
    }

    public AuthorizationRequest submit(Long id) {
        AuthorizationRequest request = getById(id);
        request.setStatus(AuthorizationStatus.SUBMITTED);
        request.setUpdatedAt(LocalDateTime.now());
        return repository.save(request);
    }

    public AuthorizationRequest approve(Long id, String remarks) {
        AuthorizationRequest request = getById(id);
        request.setStatus(AuthorizationStatus.APPROVED);
        request.setPayerRemarks(remarks);
        request.setUpdatedAt(LocalDateTime.now());
        return repository.save(request);
    }

    public AuthorizationRequest reject(Long id, String remarks) {
        AuthorizationRequest request = getById(id);
        request.setStatus(AuthorizationStatus.REJECTED);
        request.setPayerRemarks(remarks);
        request.setUpdatedAt(LocalDateTime.now());
        return repository.save(request);
    }

    public AuthorizationRequest getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Authorization request not found: " + id));
    }

    public List<AuthorizationRequest> getAll() {
        return repository.findAll();
    }
}
