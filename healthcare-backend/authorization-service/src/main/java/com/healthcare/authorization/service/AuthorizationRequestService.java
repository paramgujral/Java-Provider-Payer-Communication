package com.healthcare.authorization.service;

import com.healthcare.authorization.entity.AuthorizationRequest;
import java.util.List;

public interface AuthorizationRequestService {
    AuthorizationRequest create(AuthorizationRequest request);
    AuthorizationRequest submit(Long id);
    AuthorizationRequest approve(Long id, String remarks);
    AuthorizationRequest reject(Long id, String remarks);
    AuthorizationRequest getById(Long id);
    List<AuthorizationRequest> getAll();
}
