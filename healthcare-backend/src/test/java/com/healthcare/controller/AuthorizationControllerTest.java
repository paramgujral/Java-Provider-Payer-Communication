//package com.healthcare.controller;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.healthcare.dto.AiReviewResponse;
//import com.healthcare.entity.AuthorizationRequest;
//import com.healthcare.service.AiCopilotService;
//import com.healthcare.service.AuthorizationService;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.Pageable;
//import org.springframework.http.MediaType;
//import org.springframework.test.web.servlet.MockMvc;
//
//import java.util.List;
//
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.Mockito.when;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@WebMvcTest(AuthorizationController.class)
//class AuthorizationControllerTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    @MockBean
//    private AuthorizationService authorizationService;
//
//    @MockBean
//    private AiCopilotService aiCopilotService;
//
//    @Test
//    void analyzeRequest_ShouldReturnAiReviewResponse() throws Exception {
//        AiReviewResponse response = new AiReviewResponse();
//        response.setConfidenceScore(0.95);
//        response.setRequiresCorrection(false);
//
//        when(aiCopilotService.analyzeRequest(any(AuthorizationRequest.class))).thenReturn(response);
//
//        AuthorizationRequest request = new AuthorizationRequest();
//
//        mockMvc.perform(post("/api/v1/authorizations/analyze")
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(request)))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.confidenceScore").value(0.95))
//                .andExpect(jsonPath("$.requiresCorrection").value(false));
//    }
//
//    @Test
//    void createRequest_ShouldReturnCreatedRequest() throws Exception {
//        AuthorizationRequest request = new AuthorizationRequest();
//        request.setId("REQ-1");
//        request.setStatus(AuthorizationRequest.RequestStatus.PENDING);
//
//        when(authorizationService.createRequest(any(AuthorizationRequest.class))).thenReturn(request);
//
//        mockMvc.perform(post("/api/v1/authorizations")
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(new AuthorizationRequest())))
//                .andExpect(status().isCreated())
//                .andExpect(jsonPath("$.id").value("REQ-1"))
//                .andExpect(jsonPath("$.status").value("PENDING"));
//    }
//
//    @Test
//    void getRequestById_ShouldReturnRequest() throws Exception {
//        AuthorizationRequest request = new AuthorizationRequest();
//        request.setId("REQ-1");
//
//        when(authorizationService.getRequestById("REQ-1")).thenReturn(request);
//
//        mockMvc.perform(get("/api/v1/authorizations/REQ-1"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.id").value("REQ-1"));
//    }
//
//    @Test
//    void updateStatus_ShouldReturnUpdatedRequest() throws Exception {
//        AuthorizationRequest request = new AuthorizationRequest();
//        request.setId("REQ-1");
//        request.setStatus(AuthorizationRequest.RequestStatus.APPROVED);
//
//        when(authorizationService.updateStatus(eq("REQ-1"), any(AuthorizationRequest.RequestStatus.class)))
//                .thenReturn(request);
//
//        mockMvc.perform(patch("/api/v1/authorizations/REQ-1/status")
//                .param("status", "APPROVED"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.status").value("APPROVED"));
//    }
//}
