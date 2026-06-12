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
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .fullName("Admin")
                    .role(Role.ADMIN.valueOf("ADMIN"))
                    .enabled(true)
                    .build();

            userRepository.save(admin);
            log.info("Default admin user created: admin@gmail.com");
        }
    }
}