package com.example.demo.insurance.model;

import com.example.demo.health_care.model.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "claim_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClaimDocument extends BaseEntity {

	@Column(nullable = false)
	private String fileName;

	@Column(nullable = false)
	private String filePath;

	@Column(nullable = false)
	private String documentType;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "claim_id")
	private Claim claim;
}