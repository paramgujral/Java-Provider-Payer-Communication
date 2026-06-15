package com.example.demo.health_care.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.health_care.model.Patient;

public interface PatientRepository extends JpaRepository<Patient, UUID> {

}
