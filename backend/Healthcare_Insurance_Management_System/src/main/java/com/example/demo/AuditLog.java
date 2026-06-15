package com.example.demo;

import com.example.demo.health_care.model.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog extends BaseEntity {

	@Column(nullable = false)
	private String action;

	@Column(nullable = false)
	private String username;

	@Column(length = 2000)
	private String details;
}