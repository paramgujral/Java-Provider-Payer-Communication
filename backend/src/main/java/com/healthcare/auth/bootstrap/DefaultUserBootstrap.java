package com.healthcare.auth.bootstrap;

import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.healthcare.common.enums.Role;
import com.healthcare.user.entity.User;
import com.healthcare.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DefaultUserBootstrap implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<DefaultUserSpec> defaults = List.of(
                new DefaultUserSpec("provider.submit.9e7a15dd@example.com", "Provider", "Submit", Role.PROVIDER, "Password@123"),
                new DefaultUserSpec("payer.submit.9e7a15dd@example.com", "Payer", "Submit", Role.PAYER, "Password@123"),
                new DefaultUserSpec("admin.submit.9e7a15dd@example.com", "Admin", "Submit", Role.ADMIN, "Password@123")
        );

        for (DefaultUserSpec spec : defaults) {
            User user = userRepository.findByEmail(spec.email()).orElse(null);
            if (user == null) {
                user = User.builder()
                        .firstName(spec.firstName())
                        .lastName(spec.lastName())
                        .email(spec.email())
                        .password(passwordEncoder.encode(spec.password()))
                        .role(spec.role())
                        .enabled(true)
                        .build();
            } else {
                user.setFirstName(spec.firstName());
                user.setLastName(spec.lastName());
                user.setPassword(passwordEncoder.encode(spec.password()));
                user.setRole(spec.role());
                user.setEnabled(true);
            }
            userRepository.save(user);
        }
    }

    private record DefaultUserSpec(String email, String firstName, String lastName, Role role, String password) {
    }
}
