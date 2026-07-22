package com.healthconn.healthcare_connector.config;

import com.healthconn.healthcare_connector.authentication.entity.Role;
import com.healthconn.healthcare_connector.authentication.entity.User;
import com.healthconn.healthcare_connector.authentication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        createIfMissing("admin@gmail.com", "Admin@123", "Admin", Role.ADMIN);
        createIfMissing("provider@healthconnect.com", "password123", "Demo Provider", Role.PROVIDER);
        createIfMissing("payer@healthconnect.com", "password123", "Demo Payer", Role.PAYER);
    }

    private void createIfMissing(String email, String password, String fullName, Role role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .fullName(fullName)
                .role(role)
                .enabled(true)
                .build();
        userRepository.save(user);
        log.info("Seed user created: {} ({})", email, role);
    }
}
