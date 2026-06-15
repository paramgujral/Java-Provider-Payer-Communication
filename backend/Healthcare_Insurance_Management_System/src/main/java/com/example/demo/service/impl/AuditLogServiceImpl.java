package com.example.demo.service.impl;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.AuditLog;
import com.example.demo.repository.AuditLogRepository;
import com.example.demo.service.AuditLogService;

@Service
public class AuditLogServiceImpl implements AuditLogService {

	private final AuditLogRepository auditLogRepository;

	public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
		this.auditLogRepository = auditLogRepository;
	}

	@Override
	@Transactional
	public AuditLog create(String action, String username, String details) {
		AuditLog log = AuditLog.builder()
				.action(action)
				.username(username)
				.details(details)
				.build();
		return auditLogRepository.save(log);
	}

	@Override
	@Transactional
	public AuditLog create(String action, String username, String details, UUID claimId) {
		AuditLog log = AuditLog.builder()
				.action(action)
				.username(username)
				.details(details != null ? details : "")
				.build();
		return auditLogRepository.save(log);
	}
}
