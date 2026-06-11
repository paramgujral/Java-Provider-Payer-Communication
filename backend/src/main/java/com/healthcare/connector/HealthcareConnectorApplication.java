package com.healthcare.connector;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class HealthcareConnectorApplication {
    public static void main(String[] args) {
        SpringApplication.run(HealthcareConnectorApplication.class, args);
    }
}
