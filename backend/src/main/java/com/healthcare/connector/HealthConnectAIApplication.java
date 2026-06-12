package com.healthcare.connector;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class HealthConnectAIApplication {
    public static void main(String[] args) {
        SpringApplication.run(HealthConnectAIApplication.class, args);
    }
}
