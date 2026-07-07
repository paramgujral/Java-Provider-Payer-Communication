package com.healthconnect.provider.config;

import com.healthconnect.common.fhir.PriorAuthFhirMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AppConfig {

    @Bean
    public PriorAuthFhirMapper priorAuthFhirMapper() {
        return new PriorAuthFhirMapper();
    }

    @Bean
    public RestClient payerRestClient(@Value("${payer.base-url}") String payerBaseUrl) {
        return RestClient.builder().baseUrl(payerBaseUrl).build();
    }

    @Bean
    public WebMvcConfigurer corsConfigurer(@Value("${app.cors.allowed-origins}") String[] allowedOrigins) {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(allowedOrigins)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
            }
        };
    }
}
