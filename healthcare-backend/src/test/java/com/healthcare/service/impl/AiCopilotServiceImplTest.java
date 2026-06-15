//package com.healthcare.service.impl;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.healthcare.dto.AiReviewResponse;
//import com.healthcare.entity.AuthorizationRequest;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//
//import java.util.List;
//
//import static org.junit.jupiter.api.Assertions.*;
//
///**
// * Tests the AiCopilotServiceImpl mock fallback logic.
// * When no Gemini API key is configured, the service falls back to rule-based checks.
// */
//class AiCopilotServiceImplTest {
//
//    private AiCopilotServiceImpl aiCopilotService;
//
//    @BeforeEach
//    void setUp() {
//        // Create the service with a real ObjectMapper; no API key set so it uses mock logic
//        aiCopilotService = new AiCopilotServiceImpl(new ObjectMapper());
//    }
//
//    @Test
//    void analyzeRequest_WhenValidRequest_ShouldReturnHighConfidenceNoSuggestions() {
//        // Arrange
//        AuthorizationRequest request = new AuthorizationRequest();
//        request.setProviderId("PROV-123");
//        request.setDiagnosisCodes(List.of("A00.0"));
//        request.setProcedureCodes(List.of("12345"));
//
//        AuthorizationRequest.PatientInfo patientInfo = new AuthorizationRequest.PatientInfo();
//        patientInfo.setMemberId("MEM-123");
//        request.setPatientInfo(patientInfo);
//
//        // Act
//        AiReviewResponse response = aiCopilotService.analyzeRequest(request);
//
//        // Assert
//        assertNotNull(response);
//        assertFalse(response.isRequiresCorrection());
//        assertEquals(0.95, response.getConfidenceScore());
//        assertTrue(response.getSuggestions().isEmpty());
//    }
//
//    @Test
//    void analyzeRequest_WhenAllFieldsMissing_ShouldReturnLowConfidenceWithThreeSuggestions() {
//        // Arrange
//        AuthorizationRequest request = new AuthorizationRequest();
//        request.setProviderId("PROV-123");
//        // Missing diagnosis, procedure, and patient info
//
//        // Act
//        AiReviewResponse response = aiCopilotService.analyzeRequest(request);
//
//        // Assert
//        assertNotNull(response);
//        assertTrue(response.isRequiresCorrection());
//        assertEquals(0.65, response.getConfidenceScore());
//        assertEquals(3, response.getSuggestions().size());
//        assertTrue(response.getSuggestions().get(0).contains("diagnosis codes"));
//        assertTrue(response.getSuggestions().get(1).contains("procedure codes"));
//        assertTrue(response.getSuggestions().get(2).contains("Patient Member ID"));
//    }
//
//    @Test
//    void analyzeRequest_WhenOnlyDiagnosisCodesMissing_ShouldReturnOneSuggestion() {
//        // Arrange
//        AuthorizationRequest request = new AuthorizationRequest();
//        request.setProviderId("PROV-123");
//        request.setProcedureCodes(List.of("99213"));
//
//        AuthorizationRequest.PatientInfo patientInfo = new AuthorizationRequest.PatientInfo();
//        patientInfo.setMemberId("MEM-456");
//        request.setPatientInfo(patientInfo);
//
//        // Act
//        AiReviewResponse response = aiCopilotService.analyzeRequest(request);
//
//        // Assert
//        assertTrue(response.isRequiresCorrection());
//        assertEquals(1, response.getSuggestions().size());
//        assertTrue(response.getSuggestions().get(0).contains("ICD-10"));
//    }
//}
