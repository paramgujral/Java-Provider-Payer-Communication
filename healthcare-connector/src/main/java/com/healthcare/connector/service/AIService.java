package com.healthcare.connector.service;

import com.healthcare.connector.entity.AuthorizationRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AIService {

    public List<String> reviewRequest(AuthorizationRequest request) {

        List<String> suggestions = new ArrayList<>();

        // ---------------- Patient Information ----------------

        if (request.getPatientFirstName() == null || request.getPatientFirstName().isBlank()) {
            suggestions.add("Patient First Name is required.");
        }

        if (request.getPatientLastName() == null || request.getPatientLastName().isBlank()) {
            suggestions.add("Patient Last Name is required.");
        }

        if (request.getDateOfBirth() == null || request.getDateOfBirth().isBlank()) {
            suggestions.add("Date of Birth is required.");
        }

        if (request.getGender() == null || request.getGender().isBlank()) {
            suggestions.add("Gender is required.");
        }

        // ---------------- Insurance ----------------

        if (request.getInsuranceId() == null || request.getInsuranceId().isBlank()) {
            suggestions.add("Insurance ID is required.");
        }

        if (request.getInsuranceCompany() == null || request.getInsuranceCompany().isBlank()) {
            suggestions.add("Insurance Company is required.");
        }

        // ---------------- Provider ----------------

        if (request.getProviderName() == null || request.getProviderName().isBlank()) {
            suggestions.add("Provider Name is required.");
        }

        // ---------------- Medical ----------------

        if (request.getDiagnosis() == null || request.getDiagnosis().isBlank()) {
            suggestions.add("Diagnosis is required.");
        }

        if (request.getProcedureName() == null || request.getProcedureName().isBlank()) {
            suggestions.add("Procedure Name is required.");
        }

        // Simple diagnosis validation
        if (request.getDiagnosis() != null &&
                !request.getDiagnosis().matches("^[A-Za-z ]+$")) {

            suggestions.add("Diagnosis should contain only alphabets.");
        }

        // Example AI validation
        if ("Fever".equalsIgnoreCase(request.getDiagnosis())
                && "Heart Surgery".equalsIgnoreCase(request.getProcedureName())) {

            suggestions.add("Diagnosis and Procedure may not match.");
        }

        // Email validation
        if (request.getEmail() != null &&
                !request.getEmail().isBlank() &&
                !request.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {

            suggestions.add("Email format is invalid.");
        }

        // Mobile validation
        if (request.getMobileNumber() != null &&
                !request.getMobileNumber().isBlank() &&
                !request.getMobileNumber().matches("\\d{10}")) {

            suggestions.add("Mobile Number should contain exactly 10 digits.");
        }

        // Success
        if (suggestions.isEmpty()) {
            suggestions.add("Request looks good.");
            suggestions.add("FHIR validation passed.");
            suggestions.add("Ready to submit to payer.");
        }

        return suggestions;
    }
}