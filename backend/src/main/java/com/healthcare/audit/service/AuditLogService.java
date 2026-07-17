package com.healthcare.audit.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.healthcare.audit.entity.AuditLog;
import com.healthcare.audit.repository.AuditLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void logAction(Long userId, String action, String entity, Long entityId, String ipAddress) {
        auditLogRepository.save(AuditLog.builder()
                .userId(userId)
                .action(action)
                .entity(entity)
                .entityId(entityId)
                .ipAddress(ipAddress)
                .build());
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findAll().stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .limit(20)
                .toList();
    }
}
