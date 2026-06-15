package com.example.demo.health_care.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "diseases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Disease extends BaseEntity {

	@Column(nullable = false, unique = true)
	private String diseaseCode;

	@Column(nullable = false)
	private String diseaseName;

	@Column(length = 1000)
	private String description;
}