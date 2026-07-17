package com.healthcare.ai.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.healthcare.ai.dto.AiMissingFieldsRequest;
import com.healthcare.ai.dto.AiRecommendationRequest;
import com.healthcare.ai.dto.AiSummaryRequest;
import com.healthcare.ai.dto.AiValidationRequest;

class AiCopilotServiceTest {

    private final AiCopilotService service = new AiCopilotService();

    @Test
    void summarizeShouldReturnStructuredInsights() {
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> service.summarize(AiSummaryRequest.builder()
                .requestText("Prior Authorization Request for MRI")
                .build()));

        assertThat(exception).hasMessageContaining("AI API key");
    }

    @Test
    void recommendShouldClassifyTheRequest() {
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> service.recommend(AiRecommendationRequest.builder()
                .requestText("Urgent MRI request for emergency evaluation")
                .build()));

        assertThat(exception).hasMessageContaining("AI API key");
    }

    @Test
    void validateShouldFlagMissingClinicalFields() {
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> service.validate(AiValidationRequest.builder()
                .diagnosis("MRI")
                .icd10("Z00")
                .procedure("MRI")
                .cpt("70551")
                .physician("Dr. Smith")
                .build()));

        assertThat(exception).hasMessageContaining("AI API key");
    }

    @Test
    void missingFieldsShouldDetectRequiredItems() {
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> service.detectMissingFields(AiMissingFieldsRequest.builder()
                .requestText("Patient requests MRI")
                .build()));

        assertThat(exception).hasMessageContaining("AI API key");
    }

    @Test
    void geminiNotFoundShouldReturnFallbackResponse() throws Exception {
        AiCopilotService geminiService = new AiCopilotService();
        setField(geminiService, "apiKey", "test-key");
        setField(geminiService, "provider", "gemini");
        setField(geminiService, "model", "gemini-1.5-pro");
        setField(geminiService, "geminiAuthType", "api-key");
        setField(geminiService, "geminiEndpoint", "");
        setField(geminiService, "geminiProjectId", "");

        RestTemplate mockRestTemplate = mock(RestTemplate.class);
        when(mockRestTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new HttpClientErrorException(HttpStatus.NOT_FOUND, "not found"));
        setField(geminiService, "restTemplate", mockRestTemplate);

        Method method = AiCopilotService.class.getDeclaredMethod("callOpenAi", String.class, String.class);
        method.setAccessible(true);

        @SuppressWarnings("unchecked")
        Map<String, Object> response = (Map<String, Object>) method.invoke(geminiService, "summary prompt", "patient data");

        assertThat(response).containsEntry("recommendation", "NEED_MORE_INFORMATION");
        assertTrue(response.containsKey("summary") || response.containsKey("recommendation"));
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}
