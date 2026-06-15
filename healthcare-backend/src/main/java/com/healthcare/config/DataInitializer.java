package com.healthcare.config;

import com.healthcare.entity.User;
import com.healthcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "bharath.kankarla@toucanus.com";
        
        if (!userRepository.existsByEmail(adminEmail)) {
            log.info("No default admin found. Seeding default admin account...");
            
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .role("ADMIN")
                    .organizationId("SYSTEM")
                    .firstName("System")
                    .lastName("Administrator")
                    .active(true)
                    .build();
            
            userRepository.save(admin);
            log.info("Default admin created: {}", adminEmail);
        } else {
            log.info("Default admin already exists. Skipping initialization.");
        }
    }
}
