package com.example.demo.service;

import java.util.UUID;

import com.example.demo.AuditLog;

public interface AuditLogService {

	AuditLog create(String action, String username, String details);

	AuditLog create(String action, String username, String details, UUID claimId);
}
