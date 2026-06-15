package com.example.demo.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

}
