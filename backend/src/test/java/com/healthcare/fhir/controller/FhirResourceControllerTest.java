package com.healthcare.fhir.controller;

import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.healthcare.fhir.dto.FhirValidationIssue;
import com.healthcare.fhir.dto.FhirValidationResponse;
import com.healthcare.fhir.service.FhirResourceService;
import com.healthcare.security.JwtService;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = FhirResourceController.class,
    excludeFilters = {
        @Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.healthcare.security.SecurityConfig.class),
        @Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.healthcare.security.JwtAuthenticationFilter.class)
    })
@AutoConfigureMockMvc(addFilters = false)
class FhirResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FhirResourceService fhirResourceService;

    @MockBean
    private JwtService jwtService;

    @Test
    void createCoverageShouldReturnCreatedResponse() throws Exception {
        when(fhirResourceService.createResource(eq("Coverage"), anyString(), anyBoolean())).thenReturn("cov-1");

        mockMvc.perform(post("/api/fhir/coverage")
                        .contentType("application/fhir+json")
                        .content("{\"resourceType\":\"Coverage\",\"status\":\"active\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Coverage created"))
                .andExpect(jsonPath("$.id").value("cov-1"));
    }

    @Test
    void createClaimShouldReturnBadRequestWhenValidationFails() throws Exception {
        FhirValidationResponse validation = new FhirValidationResponse(false,
                List.of(new FhirValidationIssue("ERROR", "Missing diagnosis", null)));
        when(fhirResourceService.validateResource(anyString())).thenReturn(validation);

        mockMvc.perform(post("/api/fhir/claim?validate=true")
                        .contentType("application/fhir+json")
                        .content("{\"resourceType\":\"Claim\",\"status\":\"active\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.issues[0].message").value("Missing diagnosis"));
    }

    @Test
    void getCoverageShouldReturnStoredResource() throws Exception {
        when(fhirResourceService.getResource("cov-1")).thenReturn("{\"resourceType\":\"Coverage\",\"id\":\"cov-1\"}");

        mockMvc.perform(get("/api/fhir/coverage/cov-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resourceType").value("Coverage"))
                .andExpect(jsonPath("$.id").value("cov-1"));
    }
}
