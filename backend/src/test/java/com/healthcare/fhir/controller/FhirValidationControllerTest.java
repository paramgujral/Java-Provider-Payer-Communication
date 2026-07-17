package com.healthcare.fhir.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.healthcare.fhir.dto.FhirValidationSupportStatus;
import com.healthcare.fhir.validation.FhirValidationSupportService;
import com.healthcare.security.JwtService;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = FhirValidationController.class,
    excludeFilters = {
        @Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.healthcare.security.SecurityConfig.class),
        @Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.healthcare.security.JwtAuthenticationFilter.class)
    })
@AutoConfigureMockMvc(addFilters = false)
class FhirValidationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FhirValidationSupportService validationSupportService;

    @MockBean
    private JwtService jwtService;

    @Test
    void statusShouldExposeConfiguredValidatorDetails() throws Exception {
        FhirValidationSupportStatus status = new FhirValidationSupportStatus();
        status.setConfigured(true);
        status.setRemoteBaseUrl("http://example.org/fhir");
        status.setMessages(List.of("Bundled R4 validator initialized"));
        status.setLoadedDefinitions(List.of("http://hl7.org/fhir/StructureDefinition/Patient"));
        when(validationSupportService.getStatus()).thenReturn(status);

        mockMvc.perform(get("/api/fhir/validation/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.configured").value(true))
                .andExpect(jsonPath("$.remoteBaseUrl").value("http://example.org/fhir"))
                .andExpect(jsonPath("$.messages[0]").value("Bundled R4 validator initialized"))
                .andExpect(jsonPath("$.loadedDefinitions[0]").value("http://hl7.org/fhir/StructureDefinition/Patient"));
    }
}
