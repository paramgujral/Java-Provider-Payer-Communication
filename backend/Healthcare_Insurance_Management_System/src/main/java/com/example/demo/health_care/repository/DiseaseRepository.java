package com.example.demo.health_care.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.health_care.model.Disease;

public interface DiseaseRepository extends JpaRepository<Disease, UUID> {
}

