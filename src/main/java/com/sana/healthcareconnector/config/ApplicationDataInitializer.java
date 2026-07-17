package com.sana.healthcareconnector.config;

import com.sana.healthcareconnector.entity.UserRole;
import com.sana.healthcareconnector.entity.User;
import com.sana.healthcareconnector.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class ApplicationDataInitializer {

    @Bean
    CommandLineRunner initUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            if(userRepository.count() == 0) {

                userRepository.save(
                        new User(
                                null,
                                "provider1",
                                passwordEncoder.encode("provider12"),
                                UserRole.PROVIDER
                        )
                );

                userRepository.save(
                        new User(
                                null,
                                "provider2",
                                passwordEncoder.encode("provider123"),
                                UserRole.PROVIDER
                        )
                );

                userRepository.save(
                        new User(
                                null,
                                "provider3",
                                passwordEncoder.encode("provider1234"),
                                UserRole.PROVIDER
                        )
                );

                userRepository.save(
                        new User(
                                null,
                                "payer1",
                                passwordEncoder.encode("payer12"),
                                UserRole.PAYER
                        )
                );

                userRepository.save(
                        new User(
                                null,
                                "payer2",
                                passwordEncoder.encode("payer123"),
                                UserRole.PAYER
                        )
                );

                userRepository.save(
                        new User(
                                null,
                                "payer3",
                                passwordEncoder.encode("payer1234"),
                                UserRole.PAYER
                        )
                );

                System.out.println("Default users inserted.");
            }
        };
    }
}
